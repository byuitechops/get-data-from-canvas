/*************************************************************
 * queryData.js
 *
 * This program gets certain student information from a
 * Canvas LMS course, such as number of page views and how
 * long it takes for a grader to grade an assignment.  Then,
 * the program generates a .csv file with the data received.
 *
 *************************************************************/


// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node


// Get the query type (e.g. 'page-views' or 'review-time').
var queryType = process.argv[2];

var requestUrl = generateUrl(queryType);

// Perform the GET request and generate CSV file
request.get(url, function (error, response, body) {
  var arrayOfObjects = saveBodyElements(body, queryType);
  convertArrayToCsv(arrayOfObjects, queryType);
});


/**
 * This function generates the appropriate GET request URL,
 * based upon user input.
 * 
 * @param {String} queryType The type of data we are searching for.
 * @return {String} The Request URL needed in order to perform
 *                           the GET request.
 * @author Scott Nicholes
 */
function generateUrl(queryType) {
  // Based on the queryType, generate the appropriate URL
  switch (queryType) {
    case 'page-views':
      var user_id = process.argv[3];
      var url = 'https://byui.instructure.com/api/v1/users/' + user_id + '/page_views';
      
      break;
    case 'review-time':
      var course_id = process.argv[3];
      var url = 'https://byui.instructure.com/api/v1/courses/' + course_id + '/gradebook_history/feed';
      
      break;
  }
  
  var accessToken = process.argv[4];

  // If there are parameters, get the parameters.
  if (process.argv.length > 5) {
    for (var i = 5; i < process.argv.length; i++) {
      url += '?';
      url += process.argv[i];
      url += '&';
    }
  } 
  // Else, simply tack on what is needed to finish the URL.
  else {
    url += '?&'
  }

  url += 'access_token=';
  url += accessToken;

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

  var parsedBody = JSON.parse(body);
  if (queryType === 'page-views') {
    parsedBody.forEach(function (pageViewObject) {
      var newPageView = {
        student_id: pageViewObject.url,
        url: pageViewObject.interaction_seconds,
        timestampAccess: pageViewObject.created_at,
        timeSpent: pageViewObject.links.user
      };

      arrayOfObjects.push(newPageView);
    });
  } else {
    //console.log(parsedBody);
    parsedBody.forEach(function (submissionVersion) {
      var newSubmissionTime = {
        student_id: submissionVersion.user_id,
        student_name: submissionVersion.user_name,
        grader_id: submissionVersion.grader_id,
        grader_name: submissionVersion.grader,
        time_submitted: submissionVersion.submitted_at,
        time_graded: submissionVersion.graded_at
      };

      //console.log(newSubmissionTime);

      arrayOfObjects.push(newSubmissionTime);
    });
  }

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
  if (queryType === 'page-views') {
    var pageViewsCsv = dsv.csvFormat(arrayOfObjects, ["Student_ID", "URL", "Date/Time Accessed", "Time Spent on Page"]);

    fs.writeFileSync('pageViewsByInstance.csv', pageViewsCsv);

    return;
  } else {
    console.log(arrayOfObjects);
    var gradedTimeCsv = dsv.csvFormat(arrayOfObjects) //, ["Student_ID", "Grader_ID", "Grader_Name", "Timestamp_Submitted", "Timestamp_Graded"]);

    console.log(gradedTimeCsv);

    fs.writeFileSync('gradedTimesByStudent.csv', gradedTimeCsv);

    return;
  }
}