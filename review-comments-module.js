/*************************************************************
 * 
 *
 * This program gets certain student information from a
 * Canvas LMS course, such as number of page views and how
 * long it takes for a grader to grade an assignment.  Then,
 * the program generates a .csv file with the data received.
 *
 * 
 *************************************************************/

// Export this module
module.exports = main;

// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node
var qs = require('qs');

function main(settings) {
  console.log('module started');
  
  var requestUrl = generateUrl(settings);

  // Perform the GET request and generate CSV file
  request.get(requestUrl, function (error, response, body) {
    //console.log(body);
    var arrayOfObjects = saveBodyElements(body);
    convertArrayToCsv(arrayOfObjects, settings);
  });
}



/**
 * This function generates the appropriate GET request URL,
 * based upon the settings.
 * 
 * @param {String} queryType The type of data we are searching for.
 * @return {String} The Request URL needed in order to perform
 *                           the GET request.
 * @author Scott Nicholes
 */
function generateUrl(settings) {
  console.log('course_id: ' + settings.properties.course_id.default);
  console.log('assignment_id: ' + settings.properties.assignment_id.default);
  
  var url = 'https://byui.instructure.com/api/v1/courses/' + settings.properties.course_id.default + '/assignments/' + settings.properties.assignment_id.default + '/submissions/?include[]=user&include[]=submission_comments&access_token=';
  
  url += settings.properties.requestToken.default;
  
  console.log(url);

  return url;
}

/**
 * This function makes a new Object for the type of
 * request sought, then adds it to an array of Objects
 * that will be used to generate the CSV file later.
 * 
 * @param {String} queryType The type of data we are searching for.
 * @param   {string} body  The return body from the GET request.
 * @returns {Array} An array of the type of data
 *                             Object that we are querying.
 * @author Scott Nicholes
 */
function saveBodyElements(body) {
  var arrayOfObjects = [];

  //console.log(body);
  var parsedBody = JSON.parse(body);

  console.log(parsedBody);
  /*parsedBody.forEach(function (submission) {
    var newSubmissionTime = {
      student_id: submission.user.id,
      student_name: submission.user.name,
      grader_id: submission.grader_id,,
      time_submitted: submission.submitted_at,
      time_graded: submission.graded_at,
    };

    //console.log(newSubmissionTime);

    arrayOfObjects.push(newSubmissionTime);
  });*/

  parsedBody.forEach(function (submission) {
    submission.submission_comments.forEach(function (commentObject) {
      var newSubmissionComment = {
        student_id: submission.user.id,
        student_name: submission.user.name,
        grader_id: submission.grader_id,
        time_submitted: submission.submitted_at,
        time_graded: submission.graded_at,
        comments: commentObject.comment,
        time_commented: commentObject.created_at,
        commenter: commentObject.author.display_name
      }

      //console.log(newSubmissionComment);
      arrayOfObjects.push(newSubmissionComment);
    });
  });

  return arrayOfObjects;
}

/**
 * This function converts the array of data Objects for which 
 * we searched into a .csv file, in a human-readable format.
 * 
 * @param {Array}  arrayOfObjects Array of data objects we found from
 *                                our GET request.
 * @param {String} queryType      The type of data we are searching for.
 * @author Scott Nicholes                               
 */
function convertArrayToCsv(arrayOfObjects, settings) {
  //console.log(arrayOfObjects);
  var commentsCsv = dsv.csvFormat(arrayOfObjects);

  fs.writeFileSync('GradingPeriodAndCommentsForAssignment' + settings.properties.assignment_id.default + '.csv', commentsCsv);
}