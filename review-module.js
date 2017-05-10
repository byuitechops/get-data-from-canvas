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
var qs = require('qs');

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
    //console.log(body);
    var arrayOfSubmissions = saveSubmissions(body);
    convertArrayToCsv(arrayOfSubmissions);
    
    console.log('');
    console.log('Program ended successfully');
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
//  console.log('course_id: ' + settings.properties.course_id.default);
//  console.log('assignment_id: ' + settings.properties.assignment_id.default);
  
  // Core URL to get a Submission Object
  var url = 'https://byui.instructure.com/api/v1/courses/' + settings.properties.course_id.default + '/students/submissions/?student_ids[]=all&include[]=user&include[]=submission_comments&include[]=assignment&access_token=';
  
  url += settings.properties.requestToken.default;
  
  console.log('Request URL: ' + url);

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

  //console.log(body);
  var parsedBody = JSON.parse(body);
  
  //console.log(parsedBody);

  parsedBody.forEach(function (submission) {
    submission.submission_comments.forEach(function (commentObject) {
      var newSubmissionComment = {
        student_id: submission.user.id,
        student_name: submission.user.name,
        assignment_id: submission.assignment.id,
        assignment_name: submission.assignment.name,
        grader_id: submission.grader_id,
        time_submitted: submission.submitted_at,
        time_graded: submission.graded_at,
        comments: commentObject.comment,
        time_commented: commentObject.created_at,
        commenter: commentObject.author.display_name
      }

      //console.log(newSubmissionComment);
      newSubmissions.push(newSubmissionComment);
    });
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
  // Format the data into CSV
  var commentsCsv = dsv.csvFormat(arrayOfSubmissions);

  // Write out the CSV file for a certain assignment_id
  fs.writeFileSync('GradingPeriodAndCommentsForAllStudents.csv', commentsCsv);
}