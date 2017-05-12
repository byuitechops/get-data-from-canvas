var request = require('request')
var dsv = require('d3-dsv')
var fs = require('fs')
var qs = require('qs')
var eachLimit = require('async/eachLimit')
var Canvas = require('canvas-api-wrapper')//("10706~GRQRqCiCKrW3JM2SvJvoJSuBk4A2pRMMXdi74bUYiHJfv9L0IE1MGdtQWiQyHrlY")
var courseID;// = 14


/** Pull out who answerserd which question */
function formatQuizStatistcs(quiz, quizID, output, data) {
	quiz.quiz_statistics.forEach(stats => {
		stats.question_statistics.forEach(question => {
			question.label = "Question " + question.position
			// For questions with multiple answers, such as matching
			if (question.answer_sets) {
				question.answer_sets.forEach(subset => {
					subset.answers.forEach(answer => {
						answer.user_names.forEach(name => {
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
				})
			} else if (question.answers) {
				question.answers.forEach(answer => {
					answer.user_names.forEach(name => {
						var student = output[quizID][data.students[name]]
						// Save their name
						student["Student Name"] = name
						// Save their answer
						student[question.label] = answer.text
						// Save their score if they want that too
						student[question.label + " Score"] = answer.score || +answer.correct
					})
				})
			}
		})
	})
}

/** Pull out who answerserd which question */
function formatQuizSubmissions(quiz, quizID, output) {
	quiz.quiz_submissions.forEach(submission => {
		// Grab stuff from the api's object
		output[quizID][submission.user_id] = output[quizID][submission.user_id] || {}
		output[quizID][submission.user_id].Attempts = submission.attempt
		output[quizID][submission.user_id].Score = submission.kept_score
		output[quizID][submission.user_id].Durration = submission.time_spent
		output[quizID][submission.user_id].Finished = new Date(submission.finished_at)
		output[quizID][submission.user_id].Started = new Date(submission.started_at)
		output[quizID][submission.user_id].Quiz = quizID
	})
}

/** Run the stuff on each quiz */
function forEachQuiz(data,canvas) {
	return new Promise((resolve, reject) => {
		var output = {}
		// Only do 20 quizzes at a time, to try not overload the server
		eachLimit(data.quizzes, 20, (quiz, callback) => {
			output[quiz.id] = {}
			// calling my other functions to read and format data
			canvas.call(`courses/${courseID}/quizzes/${quiz.id}/submissions`)
				.then(stats => formatQuizSubmissions(stats, quiz.id, output))
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
	data.students = data.students.reduce((obj, node) => {
		obj[node.name] = node.id;
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
	var headerOrder = ['Student Name', 'Student ID', 'Quiz', 'Attempts', 'Score', 'Started', 'Finished', 'Durration']
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
}

/** Get this thing rolling */
module.exports = function main(accessToken,course_id){
	var data = {}
	courseID = course_id
	canvas(accessToken).call(`courses/${courseID}/students`)
		.then(value => {data['students'] = value; return data;})
		.then(formatStudents)
		.then(canvas.wrapCall(`courses/${courseID}/quizzes`))
		.then(value => {data['quizzes'] = value; return data;})
		.then(data => forEachQuiz(data,canvas))
		.then(output => printCSV(output, 'quizzes.csv'))
		.then(() => console.log('Done'))
		.catch(console.error)
}
