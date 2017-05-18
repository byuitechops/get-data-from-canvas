/*************************************************************
 * Review Module.js
 *
 * This is a module that takes the settings given it and then
 * performs a GET request using those settings.  It then
 * parses the data returned for key information.  Finally, 
 * a CSV file is generated with which the data can be further
 * reviewed.
 * 
 * Author: Scott Nicholes
 *************************************************************/

// Export this module
module.exports = main;

// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node
var async = require('async');

/**
 * The main driving function of the program.  This is the 
 * function that will be exported, comprising the module.
 * 
 * @param {Settings} settings The settings to run the program with.
 *                            
 * @author Scott Nicholes                           
 */
function main(settings) {
    // Generate the url to GET request with
    var requestUrl = generateUrl(settings);

    // Perform the GET request and generate CSV file
    request.get(requestUrl, function (error, response, body) {
        if (error) {
            console.error(error);
        }
        var arrayOfSubmissions = saveSubmissions(body);
        convertArrayToCsv(arrayOfSubmissions);

        console.log('');
    });
}


/**
 * This function generates the appropriate GET request URL,
 * based upon the settings.
 * 
 * @param   {Settings} settings The object that has the components needed to generate a request URL.
 * @returns {String}   The request URL.
 *                     
 * @author Scott Nicholes                    
 */
function generateUrl(settings) {
    // Core URL to get a Submission Object
	var props = settings.properties
    var url = `https://${props.requestUrl.default}.instructure.com/api/v1/courses/${props.course_id.default}
/students/submissions/?student_ids[]=all&include[]=user&include[]=submission_comments&include[]=assignment&access_token=${props.requestToken.default}`;
    return url;
}

/**
 * Generate new Submission Objects of the kind of data we are looking for.
 * Save these data items into an array.
 * 
 * @param   {String} body Body response from the http GET request.
 * @returns {Array}  An array of newSubmissions Objects that will be converted into CSVs.
 */
function saveSubmissions(body) {
    var newSubmissions = [];

    var parsedBody = JSON.parse(body);

    parsedBody.forEach(function (submission) {
		var newSubmissionObject = {
			student_id: submission.user.id,
			student_name: submission.user.name,
			assignment_id: submission.assignment.id,
			assignment_name: submission.assignment.name,
			grader_id: submission.grader_id,
			time_submitted: submission.submitted_at,
			time_graded: submission.graded_at,
			comments: submission.submission_comments.map(function(commentObject){return commentObject.comment}),
			time_commented: submission.submission_comments.map(function(commentObject){return commentObject.created_at}),
			commenter: submission.submission_comments.map(function(commentObject){return commentObject.author.display_name})
		}
		
		newSubmissions.push(newSubmissionObject);
    });

    return newSubmissions;
}

/**
 * This function converts the array of Submission Objects into a csv file.
 * 
 * @param {Array}    arrayOfSubmissions The data to be written to CSV
 * @param {Settings} settings           The settings that have information for the filename
 */
function convertArrayToCsv(arrayOfSubmissions) {
    // Format the data into CSVs
    var commentsCsv = dsv.csvFormat(arrayOfSubmissions);

    // Write out the CSV files
    fs.writeFileSync('GradingPeriodAndCommentsForAllStudents.csv', commentsCsv);
    console.log('Wrote Review Files');
}
