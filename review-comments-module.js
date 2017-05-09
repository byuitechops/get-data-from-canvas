/*************************************************************
 * queryData.js
 *
 * This program gets certain student information from a
 * Canvas LMS course, such as number of page views and how
 * long it takes for a grader to grade an assignment.  Then,
 * the program generates a .csv file with the data received.
 *
 * 
 *************************************************************/


// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node
var qs = require('qs');

function main(settings) {
  var requestUrl = generateUrl(settings);

  // Perform the GET request and generate CSV file
  request.get(requestUrl, function (error, response, body) {
    //console.log(body);
    var arrayOfObjects = saveBodyElements(body);
    convertArrayToCsv(arrayOfObjects);
  });
}



/**
 * This function generates the appropriate GET request URL,
 * based upon user input.
 * 
 * @param {String} queryType The type of data we are searching for.
 * @return {String} The Request URL needed in order to perform
 *                           the GET request.
 * @author Scott Nicholes
 */
function generateUrl(settings) {
  // Based on the queryType, generate the appropriate URL
  var url = '';


  // REFORM: Get the parameters from the Settings
  
  url = 'https://byui.instructure.com/api/v1/courses/' + settings.course_id + '/assignments/' + settings.assignment_id + '/submissions/';


  var parametersString = process.argv[3];
  //console.log(parametersString);
  var parametersObject = qs.parse(parametersString);
  //console.log(parametersObject);
  url = 'https://byui.instructure.com/api/v1/courses/' + parametersObject.course_id + '/assignments/' + parametersObject.assignment_id + '/submissions/?include[]=user&include[]=submission_comments?&access_token=';


  var accessToken = process.argv[4];
  url += accessToken;

  //console.log(accessToken);
  console.log('request URL: ' + url);

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
function saveBodyElements(body, queryType) {
  var arrayOfObjects = [];

  //console.log(body);
  var parsedBody = JSON.parse(body);

  //console.log(parsedBody);
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

      console.log(newSubmissionComment);
      arrayOfObjects.push(newSubmissionComment);
    });

    /*submission.submission_comments.forEach(function (commentObject) {
      arrayOfComments.push(commentObject.comment);
    });*/
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
function convertArrayToCsv(arrayOfObjects, queryType) {
  //console.log(arrayOfObjects);
  var commentsCsv = dsv.csvFormat(arrayOfObjects);

  var parametersString = process.argv[3];
  var parametersObject = qs.parse(parametersString);

  fs.writeFileSync('GradingPeriodAndCommentsForAssignment' + parametersObject.assignment_id + '.csv', commentsCsv);
}
