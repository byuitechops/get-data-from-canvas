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
var paginator = require('canvas-pagination');
var Canvas = require('canvas-api-wrapper');
var canvas;


/**
 * The main driving function of the program.  This is the 
 * function that will be exported, comprising the module.
 * 
 * @param {object} settings The settings to run the program with.
 *                            
 * @author Scott Nicholes                           
 */
function main(settings, callback) {
    // This is the apiCall we'll use to get all the quiz submissions
    var apiCall = `/api/v1/courses/${settings.properties.course_id.default}/students/submissions/`;

    // Paginator will take the base url, apiCall, and a queryObject and then handle the pagination of all the submissions
    paginator(`https://${settings.properties.requestUrl.default}.instructure.com`, apiCall, {
        "student_ids[]": ["all"],
        "include[]": ["submission_comments", "assignment", "user"],
        access_token: settings.properties.requestToken.default
    }, function (error, data) {
        if (error) {
            callback(error, null);
        }

        // Now we have all the paginated data
        var arrayOfSubmissions = saveSubmissions(data);
        //convertArrayToCsv(arrayOfSubmissions);
        callback(null, arrayOfSubmissions);
    });
}

/**
 * Generate new Submission Objects of the kind of data we are looking for.
 * Save these data items into an array.
 * 
 * @param   {String} submissions Paginated, JSON Parsed object
 * @returns {Array}  An array of newSubmissions Objects that will be converted into CSVs.
 *                   
 * @author Scott Nicholes                  
 */
function saveSubmissions(submissions) {
    var newSubmissions = [];

    submissions.forEach(function (submission) {
        var newSubmissionObject = {
            student_id: submission.user.id,
            student_name: submission.user.name,
            assignment_id: submission.assignment.id,
            assignment_name: submission.assignment.name,
            grader_id: submission.grader_id,
            time_submitted: submission.submitted_at,
            time_graded: submission.graded_at,
            comments: submission.submission_comments.map(function (commentObject) {
                return commentObject.comment
            }),
            time_commented: submission.submission_comments.map(function (commentObject) {
                return commentObject.created_at
            }),
            commenter: submission.submission_comments.map(function (commentObject) {
                return commentObject.author.display_name
            })
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
    var filename = 'reviewTimesAndComments.csv';
    fs.writeFileSync(filename, commentsCsv);
    console.log('Wrote ' + filename);
}
