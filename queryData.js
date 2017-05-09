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


// Get the query type (e.g. 'page-views', 'review-time' or 'logins').
var queryType = process.argv[2];

var requestUrl = generateUrl(queryType);

// Perform the GET request and generate CSV file
request.get(requestUrl, function (error, response, body) {
  var displayBody = JSON.parse(body);
  
  console.log(displayBody);
  /*var arrayOfObjects = saveBodyElements(body, queryType);
  convertArrayToCsv(arrayOfObjects, queryType);*/
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
  var url = '';
  switch (queryType) {
    case 'page-views':
      var user_id = process.argv[3];
      url = 'https://byui.instructure.com/api/v1/users/' + user_id + '/page_views';

      break;
    case 'review-time':
      var course_id = process.argv[3];
      url = 'https://byui.instructure.com/api/v1/courses/' + course_id + '/gradebook_history/feed';


      // FOR COMMENTS: url = 'https://byui.instructure.com/api/v1/courses/15/assignments/144/submissions/';

      break;
    case 'logins':
      var user_id = process.argv[3];
      url = 'https://byui.instructure.com/api/v1/audit/authentication/users/' + user_id;

      break;
    case 'comments':
      var parametersString = process.argv[3];
      //console.log(parametersString);
      var parametersObject = qs.parse(parametersString);
      //console.log(parametersObject);
      url = 'https://byui.instructure.com/api/v1/courses/' + parametersObject.course_id + '/assignments/' + parametersObject.assignment_id + '/submissions/';
  }

  var accessToken = process.argv[4];

  // If there are parameters, get the parameters.
  if (process.argv.length > 5) {
    url += '?';
    for (var i = 5; i < process.argv.length; i++) {
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

  switch (queryType) {
    case 'page-views':
      parsedBody.forEach(function (pageViewObject) {
        var newPageView = {
          student_id: pageViewObject.url,
          url: pageViewObject.interaction_seconds,
          timestampAccess: pageViewObject.created_at,
          timeSpent: pageViewObject.links.user
        };

        arrayOfObjects.push(newPageView);
      });
      break;

    case 'review-time':
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
      break;

    case 'logins':
      var newStudentLoginCount = {
        student_id: parsedBody.events[0].links.user,
        logins: 0
      }
      parsedBody.events.forEach(function (event) {
        // First, check to see if it is a login event
        if (event.event_type === 'login') {
          // Because we know that all these events are for
          //  the same user, we now know that the event
          //  we are on is a valid login event.
          newStudentLoginCount.logins++;
        }
      });

      arrayOfObjects.push(newStudentLoginCount);

      break;
    case 'comments':
      console.log(parsedBody);
      parsedBody.forEach(function (submission) {
        submission.submission_comments.forEach(function (commentObject) {
          var newSubmissionComment = {
            student_id: submission.user_id,
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

      break;
  }
  
  //console.log(arrayOfObjects);
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
  switch (queryType) {
    case 'page-views':
      var pageViewsCsv = dsv.csvFormat(arrayOfObjects, ["Student_ID", "URL", "Date/Time Accessed", "Time Spent on Page"]);

      fs.writeFileSync('pageViewsByInstance.csv', pageViewsCsv);

      break;
    case 'review-time':
      var gradedTimeCsv = dsv.csvFormat(arrayOfObjects) //, ["Student_ID", "Grader_ID", "Grader_Name", "Timestamp_Submitted", "Timestamp_Graded"]);


      //var parsedAssignmentId = process.argv[5].replace('assignment_id=', '');
      fs.writeFileSync('gradedTimesByStudentForAssignmentTest.csv', gradedTimeCsv);

      break;
    case 'logins':
      var loginsCsv = dsv.csvFormat(arrayOfObjects);

      // Parse out the startTime for title of file
      var parsedStartTime = process.argv[5].replace('start_time=', '');
      fs.writeFileSync('studentLoginsFor' + parsedStartTime + '.csv', loginsCsv);

      break;
    case 'comments':
      //console.log(arrayOfObjects);
      var commentsCsv = dsv.csvFormat(arrayOfObjects);

      var parametersString = process.argv[3];
      var parametersObject = qs.parse(parametersString);

      fs.writeFileSync('CommentsForAssignment' + parametersObject.assignment_id + '.csv', commentsCsv);

      break;
  }
}
