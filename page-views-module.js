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

// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node
var qs = require('qs');
var async = require('async');
var paginator = require('canvas-pagination');
var Canvas = require('canvas-api-wrapper');
var chalk = require('chalk');
var canvas;


/**
 * The main driving function of the program.  This is the 
 * function that will be exported, comprising the module.
 * 
 * @param {object} settings The settings to run the program with.
 *                       
 * @author Scott Nicholes                           
 */
function main(settings, returnCallback) {
    function errorHandler(error) {
        returnCallback(error, null);
        //return;
    }

    // Canvas Arguments: <access token>, <domain>, <verbose logging>
    canvas = new Canvas(settings.accessToken, settings.domain, false);

    var rangeOptions = {};
    if (settings.runWithRange === 'yes') {
        rangeOptions.start_time = settings.start_time;
        rangeOptions.end_time = settings.end_time;
    }

    // Uncomment for Experimental code (see below)
    //rangeOptions.access_token = settings.accessToken;


    canvas.callbackCall(`/api/v1/accounts/self/roles`, {}, 'GET', function (rolesError, roles) {
        //console.log(roles);
        //console.log(rolesError);
        if (rolesError) {
            if (rolesError === 401) {
                errorHandler('Code: ' + rolesError + ': Unauthorized.  Please supply an Admin Access Token');
                return;
            } else {
                errorHandler('Code: ' + rolesError);
                return;
            }
            return;
        } else if (!roles) {
            errorHandler('Fatal: ' + roles);
            return;
        } else if (roles[0].role === 'AccountAdmin') {
            // We now know that we have an Admin token

            // Get all the student ids for the course we are looking at
            canvas.callbackCall(`courses/${settings.course_id}/students`, {}, 'GET', function (err, students) {
                // Check for errors
                if (err) {
                    errorHandler(err);
                    return;
                }
                //remove all the test students from the student list because the page_view api returns "unauthorized"

                students = students.filter(function (student) {
                    return student.id !== 5403155
                });

                // Loop through all the student objects
                async.mapLimit(students, 5, function (student, callback) {
                        /*
                        Reason this code does not work (Updated 7 June, 2017):
                        Because in canvas-pagination/canvas-pagination.js, the program realizes that we need to get
                        each page one by one.  The function at the bottom of the program in canvas-pagination.js that would
                        grab each page one by one (oneByOne()) is not defined yet.
                        // BEGIN EXPERIMENT
                        var apiCall = `/api/v1/users/${student.id}/page_views`;
                        paginator(`https://${settings.requestUrl}.instructure.com`, apiCall, rangeOptions, function (error, exppageViews) {
                            if (error) {
                                console.error('There was a page_views reading error: ' + error);
                                callback(error, null);
                            } else {
                                var newPageViews = savePageViews(exppageViews);
                                callback(null, newPageViews);
                            }
                        });
                        // END EXPERIMENT
                        */

                        // Get the page views for each student
                        canvas.callbackCall(`users/${student.id}/page_views`, rangeOptions, 'GET', function (pageViewError, pageViews) {
                            // Check for errors
                            if (pageViewError) {
                                // Parse the error as a JSON Object
                                var parsedError = JSON.parse(pageViewError);

                                /**
                                 * The following code is to account for the "Test Student" found when making a
                                 * page_views API calls on all the students.  The Test Student returns an
                                 * "unauthorized" error code on the page_views API call done on it.
                                 **/
                                // See if the error is just an unauthorized, or if it is something bigger
                                if (parsedError.status !== 'unauthorized') {
                                    callback(pageViewError, null);
                                } else {
                                    // We are unauthorized, but there is not a fatal error, so just send an empty array
                                    console.log(chalk.yellow(JSON.stringify(student, null, 3)))
                                    console.log(chalk.yellow('An unauthorized API call was made.  Continuing program...'))
                                    callback(null, []);
                                }
                            } else {
                                var newPageViews = savePageViews(pageViews);
                                callback(null, newPageViews);
                            }
                        });
                    },
                    function (mapError, result) {
                        if (mapError) {
                            errorHandler(mapError);
                            return;
                        }
                        var pageViewsOut = result.reduce(function (accum, currentValue) {
                            return accum.concat(currentValue);
                        }, []);

                        returnCallback(null, pageViewsOut);
                    });
            });
        }
    });
}

/**
 * This is a wrapper function that will call the call function in the canvas-wrapper-api program
 * 
 * @param {string}   apiCall  The API call that we want to perform
 * @param {object}   options  A query string object that defines the options to append to the API call
 * @param {function} callback A callback function that allows us to pass data out of this ASYNC operation
 *                            
 * @author Ben Earl                           
 */
function call(apiCall, options, callback) {
    canvas.call(apiCall, options).then(function (data) {
        callback(null, data);
    }, function (error) {
        callback(error, null);
    });
}

/**
 * Generate new Submission Objects of the kind of data we are looking for.
 * Save these data items into an array.
 * 
 * @param   {String} body Body response from the http GET request.
 * @returns {Array}  An array of newPageViews Objects that will be converted into CSVs.
 *                   
 * @author Scott Nicholes                  
 */
function savePageViews(pageViews) {
    var formattedPageViews = [];

    if (pageViews !== null || pageViews !== undefined) {
        pageViews.forEach(function (pageViewObject, index, iteratingArray) {
            var currentDate;
            var forwardDate;
            var differenceSeconds;
            if (iteratingArray[index + 1]) {
                currentDate = new Date(pageViewObject.created_at);
                forwardDate = new Date(iteratingArray[index + 1].created_at);
                differenceSeconds = currentDate - forwardDate;
                differenceSeconds = differenceSeconds / 1000;

                if (differenceSeconds >= 1800) {
                    differenceSeconds = 1800;
                }
            }

            var newPageView = {
                student_id: pageViewObject.links.user,
                url: pageViewObject.url,
                timestampAccess: pageViewObject.created_at,
                timeDifference: iteratingArray[index + 1] ? differenceSeconds : 0
            };

            formattedPageViews.push(newPageView);
        });
    }

    return formattedPageViews;
}

// Export this module
module.exports = main;
