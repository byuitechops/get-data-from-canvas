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
var Canvas = require('canvas-api-wrapper')
var canvas;

/**
 * The main driving function of the program.  This is the 
 * function that will be exported, comprising the module.
 * 
 * @param {Settings} settings The settings to run the program with.
 *                            
 * @author Scott Nicholes                           
 */
function main(settings) {
    canvas = new Canvas(settings.properties.requestToken.default, settings.properties.requestUrl.default);

    var rangeOptions = {};
    if (settings.properties.runWithRange.default === 'yes') {
        rangeOptions.start_time = settings.properties.start_time.default;
        rangeOptions.end_time = settings.properties.end_time.default;
    }
    //console.log(rangeOptions);

    call(`/api/v1/accounts/self/roles`, {}, function (rolesError, roles) {
        //console.log(rolesError);
        if (rolesError) {
            if (rolesError === 401) {
                console.error('Page Views Error Code: ' + rolesError + ': Unauthorized.  Please supply an Admin Access Token');
                return;
            } else {
                console.error('Page Views Error Code: ' + rolesError);
                return;
            }
        } else if (!roles) {
            console.error('Page Views Error:  Fatal');
            return;
        } else if (roles[0].role === 'AccountAdmin') {
            call(`courses/${settings.properties.course_id.default}/students`, {}, function (err, students) {
                // Check for errors
                if (err) {
                    console.error(err);
                    return;
                }

                // Loop through all the students
                async.mapLimit(students, 30, function (student, callback) {
                    call(`users/${student.id}/page_views`, rangeOptions, function (pageViewError, pageViews) {
                        // Check for errors
                        if (pageViewError) {
                            console.log(pageViewError);
                            callback(pageViewError, null);
                            //return;
                        } else {
                            var newPageViews = savePageViews(pageViews);
                            callback(null, newPageViews);
                        }
                    });
                }, function (mapError, result) {
                    if (mapError) {
                        //console.error(mapError);
                        console.error('Arf');
                        return;
                    }
                    var pageViewsOut = result.reduce(function (accum, currentValue) {
                        return accum.concat(currentValue);
                    }, []);

                    convertArrayToCsv(pageViewsOut);
                });
            });

            return;
        }
    });
}

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
 */
function savePageViews(parsedBody) {
    var newPageViews = [];

    parsedBody.forEach(function (pageViewObject, index, iteratingArray) {
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

        newPageViews.push(newPageView);
    });

    return newPageViews;
}

/**
 * This function converts the array of Submission Objects into a csv file.
 * 
 * @param {Array}    arrayOfPageViews The data to be written to CSV
 * @param {Settings} settings           The settings that have information for the filename
 */
function convertArrayToCsv(arrayOfPageViews) {
    // Format the data into CSV
    var pageViewsCsv = dsv.csvFormat(arrayOfPageViews);

    // Write out the CSV file for a certain assignment_id
    var filename = 'pageViews.csv';
    fs.writeFileSync(filename, pageViewsCsv);
    console.log('Wrote ' + filename);
}

// Export this module
module.exports = main;
