/******************************************************
 * Quiz-Module.js
 * This module performs the GET requests necessary to
 * get the quiz statistics needed for each question.
 * 
 * Author: Ben Earl
 *******************************************************/
var request = require('request')
var dsv = require('d3-dsv')
var fs = require('fs')
var qs = require('qs')
var eachLimit = require('async/eachLimit')
var Canvas = require('canvas-api-wrapper') //("10706~GRQRqCiCKrW3JM2SvJvoJSuBk4A2pRMMXdi74bUYiHJfv9L0IE1MGdtQWiQyHrlY")
var courseID; // = 14


/** Pull out who answerserd which question */
function formatQuizStatistcs(quiz, quizID, output, data) {
    quiz.quiz_statistics.forEach(stats => {
        stats.question_statistics.forEach(question => {
            question.label = "Question " + question.position
            // For questions with multiple answers, such as matching
            if (question.answer_sets) {
                question.answer_sets.forEach(subset => {

                    if (Array.isArray(subset.answers)) {
                        subset.answers.forEach(answer => {
                            answer.user_names.forEach(name => {
                                output[quizID][data.students[name]] = output[quizID][data.students[name]] || {}

                                var student = output[quizID][data.students[name]]

                                // Save their name
                                student["Student Name"] = name
                                // Save their answer
                                student[question.label + " " + subset.text] = answer.text
                                // Save their score if they want that too
                                student[question.label + " Score"] = student[question.label] || []
                                student[question.label + " Score"].push(answer.score || +answer.correct)

                            })
                        })
                    }
                })
            } else if (question.answers) {

                if (Array.isArray(question.answers)) {
                    question.answers.forEach(answer => {
                        answer.user_names.forEach(name => {
                            //console.log(output);
                            output[quizID][data.students[name]] = output[quizID][data.students[name]] || {}

                            var student = output[quizID][data.students[name]];

                            // Save their name
                            student["Student Name"] = name
                            // Save their answer
                            student[question.label] = answer.text
                            // Save their score if they want that too
                            student[question.label + " Score"] = answer.score || +answer.correct
                        })
                    })
                }
            }
        })
    })
}

/** Pull out who answerserd which question */
function formatQuizSubmissions(quiz, quizID, output) {
    // At this point, outut has nothing in it for this quizId


    if (quiz.quiz_submissions) {
        quiz.quiz_submissions = quiz.quiz_submissions || []
        quiz.quiz_submissions.forEach(submission => {
            // Grab stuff from the api's object
            output[quizID][submission.user_id] = output[quizID][submission.user_id] || {}
            output[quizID][submission.user_id].Attempts = submission.attempt
            output[quizID][submission.user_id].Score = submission.kept_score
            output[quizID][submission.user_id]["Duration In Seconds"] = submission.time_spent
            output[quizID][submission.user_id].Finished = new Date(submission.finished_at)
            output[quizID][submission.user_id].Started = new Date(submission.started_at)
            output[quizID][submission.user_id].Quiz = quizID
        })
    } else {
        // There is no quiz_submissions property, but there is still data
        quiz.forEach(function (submission) {
            output[quizID][submission.user_id] = output[quizID][submission.user_id] || {}
            output[quizID][submission.user_id].Attempts = submission.attempt
            output[quizID][submission.user_id].Score = submission.kept_score
            output[quizID][submission.user_id]["Duration In Seconds"] = submission.time_spent
            output[quizID][submission.user_id].Finished = new Date(submission.finished_at)
            output[quizID][submission.user_id].Started = new Date(submission.started_at)
            output[quizID][submission.user_id].Quiz = quizID
        });
    }
}

/**
 * Run the various API Calls on each quiz found in our data object
 * 
 * @param   {object}   data   The mapped Object in the format '<StudentName>': <StudentID>
 * @param   {function} canvas The Canvas Instance with which we will make our API Calls
 * @returns {object}   The Output Object ready to be converted to CSV
 *                     
 * @author Ben Earl
 * @lastmodifiedBy Scott Nicholes
 */
function forEachQuiz(data, canvas) {
    return new Promise((resolve, reject) => {
        // This object will serve as our output data to be converted to CSV
        var output = {}

        // For Each quiz, get the submissions and statistics
        // Only do 20 quizzes at a time, to try not overload the server
        eachLimit(data.quizzes, 20, (quiz, callback) => {
            // Each quiz ID shall have an object on it that will have the submission and statistical data
            output[quiz.id] = {}
            // calling my other functions to read and format data
            canvas.call(`courses/${courseID}/quizzes/${quiz.id}/submissions`)
                .then(function (stats) {
                    formatQuizSubmissions(stats, quiz.id, output)
                })
                .then(canvas.wrapCall(`courses/${courseID}/quizzes/${quiz.id}/statistics`))
                .then(stats => formatQuizStatistcs(stats, quiz.id, output, data))
                .then(callback)
                .catch(console.error)
            // I don't care about passing the errors on to later
        }, () => resolve(output))
    })
}

/**
 * Turn the data object into a map that maps the student name to its ID.
 * @param   {object} data The data object that will organize our GET request data
 * @returns {object} The completed Mapped Object
 */
function formatStudents(data) {
    // all I need is a map from their name to their ID
    data.students = data.students.reduce((obj, student) => {
        obj[student.name] = student.id;
        return obj
    }, {})
}

/** Some final formatting, then save the csv file out */
function printCSV(data, fileName) {
    // Reformat my objects into the array that d3-dsv expects
    var arr = []
    for (var quizID in data) {
        for (var studentID in data[quizID]) {
            arr.push(Object.assign({
                'Student ID': studentID
            }, data[quizID][studentID]))
        }
    }
    // This is to prevent the headers coming out in alphabetical order
    var headerOrder = ['Student Name', 'Student ID', 'Quiz', 'Attempts', 'Score', 'Started', 'Finished', 'Duration In Seconds']
    // What is this list missing?
    var questionHeaders = Object.keys(arr.reduce((a, b) => Object.assign({}, a, b))).filter(n => headerOrder.indexOf(n) < 0)

    // special answer formatting if they need it,
    arr.forEach(row => {
        questionHeaders.forEach(qHead => {
            if (Array.isArray(row[qHead])) {
                row[qHead] = row[qHead].reduce((a, b) => a + b) / row[qHead].length
            } else if (typeof row[qHead] == "object") {
                row[qHead] = JSON.stringify(row[qHead]).replace(/["{}]/g, '')
            }
        })
    })
    // also add the questions to the header, so that it dosen't ignore them
    headerOrder = headerOrder.concat(questionHeaders)
    // write to our file
    fs.writeFileSync(fileName, dsv.csvFormat(arr, headerOrder))
    console.log('Wrote ' + fileName);
}

/**
 * This program will call various API calls in order to compile a final Quiz CSV file.
 * 
 * @param   {String}   accessToken The access token that we will use to access Canvas
 * @param   {String}   course_id   The strung number that represents the course's quizzes
 * @param   {String}   domain      The domain name (ex: byui) of the Canvas domain
 * 
 * @author Ben Earl
 * @lastmodifiedBy Scott Nicholes
 */
module.exports = function main(accessToken, course_id, domain) {
    // The object that we will use to organize the data we receive
    var data = {}
    courseID = course_id

    // Create the Canvas API Wrapper instance
    var canvas = Canvas(accessToken, domain);

    // Begin Promise Chain.  We will first get the list of student objects
    canvas.call(`courses/${courseID}/students`)
        .then(value => {
            // Value is the list of student objects
            data.students = value;

            // Pass the data object on to the next Promise statement
            return data;
        })
        .then(formatStudents)
        .then(canvas.wrapCall(`courses/${courseID}/quizzes`), {})
        .then(value => {
            data.quizzes = value;
            //console.log(data);
            return data;
        })
        .then(data => forEachQuiz(data, canvas))
        .then(output => printCSV(output, 'quizzes.csv'))
        .catch(console.error)
}
