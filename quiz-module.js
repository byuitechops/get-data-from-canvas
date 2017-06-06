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

    //console.log(output[quizID]);
}

/** Run the stuff on each quiz */
function forEachQuiz(data, canvas) {
    return new Promise((resolve, reject) => {
        var output = {}
        // Only do 20 quizzes at a time, to try not overload the server
        eachLimit(data.quizzes, 20, (quiz, callback) => {
            //console.log(quiz);
            output[quiz.id] = {}
            // calling my other functions to read and format data
            canvas.call(`courses/${courseID}/quizzes/${quiz.id}/submissions`)
                .then(function (stats) {
                    //console.log(stats);
                    //console.log(quiz.id);
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

/** Turn the object into a map of name to ID */
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

/** Get this thing rolling */
module.exports = function main(accessToken, course_id, domain) {
    var data = {}
    courseID = course_id
    var canvas = Canvas(accessToken, domain);
    canvas.call(`courses/${courseID}/students`)
        .then(value => {
            data.students = value;
            //console.log(data);
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
