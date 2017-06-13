/*eslint-env node*/
/*eslint no-console:0, no-unused-vars:0*/

/*************************************************************
 * Generate Data.js
 * This program prompts the user for key information in order
 * to perform various https GET requests.  It then produces
 * a CSV file by which the data can be further reviewed.
 *
 * Authors: Scott Nicholes & Benjamin Earl
 ************************************************************/
var prompt = require('prompt');
var fs = require('fs');
var async = require('async');
var reviewTimeAndComments = require('./review-module.js');
var quizConverter = require('./quiz-module.js');
var pageViews = require('./page-views-module.js');
var chalk = require('chalk');
var dsv = require('d3-dsv');

/**
 * The main driving function of the program.
 * It first welcomes the user and then continues to prompt the user
 * if the settings should be changed before the actual conversion
 * module is run.
 * 
 * @author Scott Nicholes
 */
function main() {
    console.log('');
    console.log('Welcome to the program!');
    console.log('----------------------------------------');

    getSettings(function (error, runObject) {
        if (!runObject.decision) {
            endProgram();
        }

        // Save the settings
        var readyToWriteSettings = JSON.stringify(runObject.settings);
        fs.writeFileSync('settings.json', readyToWriteSettings)

        // Run the program with the settings
        getData(runObject.settings, function (error, data) {
            saveData(data);
            endProgram();
            return;
        });
    });
}


function getSettings(callback) {
    var returnObject = {};

    // Load the settings from settings.json
    var settings = fs.readFileSync('settings.json', 'utf8');

    // Parse the settings
    settings = JSON.parse(settings);

    // Here, we shall store our prompts
    var requestSettingsChange = {
        properties: {
            changeSettings: {
                description: 'Do you want to change the settings before running the program?(yes/no)',
                type: 'string',
                pattern: /^(?:yes\b|no\b)/,
                message: 'Enter only \'yes\' or \'no\''
            }
        }
    }

    var changeSettingsPrompt = {
        properties: {
            domain: {
                description: "Enter Domain(Example: byui)",
                type: "string",
                default: settings.domain
            },
            course_id: {
                description: "Enter Course_Id",
                type: "string",
                default: settings.course_id
            },
            runWithRange: {
                description: "Run program with a start and end time range for page views?(yes/no)",
                type: "string",
                message: "Enter only 'yes' or 'no'",
                default: settings.runWithRange,
                pattern: /^(?:yes\b|no\b)/
            },
            start_time: {
                description: "Enter start_time for student page views (Example: 2012-07-19)",
                type: "string",
                default: settings.start_time,
                ask: function () {
                    return prompt.history('runWithRange').value === 'yes'
                }
            },
            end_time: {
                description: "Enter end_time for student page views (Example: 2012-07-19)",
                type: "string",
                default: settings.end_time,
                ask: function () {
                    return prompt.history('runWithRange').value === 'yes'
                }
            },
            accessToken: {
                description: "Enter access token",
                type: "string",
                default: settings.accessToken
            }
        }
    }

    var startWithChangedSettings = {
        properties: {
            startProgram: {
                description: 'Do you want to start the program with the current settings?(yes/no)',
                type: 'string',
                pattern: /^(?:yes\b|no\b)/,
                message: 'Enter only \'yes\' or \'no\''
            }
        }
    }


    // Prompt the user with the first prompt
    console.log('Settings to run conversion program with:');
    console.log('Request Url: ' + settings.domain);
    console.log('Course ID: ' + settings.course_id);
    console.log('Start Program with Time Range for Page Views: ' + settings.runWithRange);
    console.log('Start Time For Page Views: ' + settings.start_time);
    console.log('End Time For Page Views: ' + settings.end_time);
    console.log('Access Token: ' + settings.accessToken);
    console.log('');

    prompt.start();
    prompt.get(requestSettingsChange, function (error, response) {
        if (error) {
            console.error('There was an error in the prompting process: ' + error);
            callback(error, null);
            return;
        }

        if (response.changeSettings === 'no') {
            // Return the unchanged settings
            returnObject.settings = settings;
            returnObject.decision = true;

            callback(null, returnObject);
            return;
        } else {
            // Prompt the user to change the settings
            prompt.get(changeSettingsPrompt, function (error, response) {
                if (error) {
                    console.error('There was an error in the prompting process: ' + error);
                    callback(error, null);
                    return;
                }

                // Now we have the new settings vested in response
                console.log('\n');
                console.log('Request Url: ' + response.domain);
                console.log('Course ID: ' + response.course_id);
                console.log('Start Program with Time Range for Page Views: ' + response.runWithRange)
                console.log('Start Time For Page Views: ' + response.start_time);
                console.log('End Time For Page Views: ' + response.end_time);
                console.log('Access Token: ' + response.accessToken);

                prompt.get(startWithChangedSettings, function (error, decision) {
                    if (error) {
                        console.error('There was an error in the prompting process: ' + error);
                        callback(error, null);
                        return;
                    }

                    var runProgram;
                    if (decision.startProgram === 'yes') {
                        runProgram = true;
                    } else {
                        runProgram = false;
                    }

                    returnObject.settings = response;
                    returnObject.decision = runProgram;

                    callback(null, returnObject);
                    return;
                });
            });
        }
    });
}

function getData(settings, parentCallback) {
    // Run the program
    console.log('');
    var functionCalls = [generateReviews, generateQuizzes, generatePageViews];

    // Perform an async waterfall.  At the end, we will have an accumulated Array with the compiled return objects
    async.waterfall(functionCalls, function (error, accumulatedArray) {
        if (error) {
            console.error(chalk.red(error));
        }

        parentCallback(null, accumulatedArray);
        return;
    });

    // Our Waterfall Function Declarations
    function generateReviews(callback) {
        console.log(chalk.white('Starting review and comments module'));
        reviewTimeAndComments(settings, function (error, data) {
            if (error) {
                console.error(chalk.red('Review and comments ERROR: ' + error));
                callback(null, []);
                return;
            }

            console.log(chalk.green('Review and Comments Success'));
            callback(null, [generateArrayEntry('reviewTimesAndComments.csv', data)]);
            return;
        });
    }

    function generateQuizzes(accumArray, callback) {
        if (typeof accumArray === 'function') {
            callback = accumArray;
            accumArray = [];
        }


        console.log(chalk.white('Starting quizzes module'));
        quizConverter(settings.accessToken, settings.course_id, settings.domain, function (error, data, headers) {
            if (error) {
                console.error(chalk.red('Quizzes ERROR: ' + error));
                callback(null, accumArray);
                return;
            }

            console.log(chalk.green('Quizzes Success'));
            accumArray.push(generateArrayEntry('quizzes.csv', data, headers));
            callback(null, accumArray);
            return;
        });
    }

    function generatePageViews(accumArray, callback) {
        if (typeof accumArray === 'function') {
            callback = accumArray;
            accumArray = [];
        }

        console.log(chalk.white('Starting Page Views module'));
        pageViews(settings, function (error, data) {
            if (error) {
                console.error(chalk.red('Page Views ERROR: ' + error));
                callback(null, accumArray);
                return;
            }

            console.log(chalk.green('Page Views Success'));
            //console.log(JSON.parse(chalk.blue(data[0])));
            accumArray.push(generateArrayEntry('pageViews.csv', data));
            callback(null, accumArray);
            return;
        });
    }

    function generateArrayEntry(filename, data, headerData) {
        var returnObject = {
            fileName: filename,
            data: data,
            headers: headerData
        }

        return returnObject;
    }
}

function saveData(data) {
    console.log('');
    console.log('Writing Files...');
    console.log('-------------------------');

    for (var i = 0; i < data.length; i++) {
        // Format the data into CSVs
        var outputCsv = dsv.csvFormat(data[i].data, data[i].headers);

        // Write out the CSV files
        var filename = data[i].fileName;
        try {
            fs.writeFileSync(filename, outputCsv);
            console.log(chalk.green('Wrote ' + filename));
        } catch (e) {
            console.log(chalk.red('Failed to write ' + filename + ': ' + e));
            return;
        }
    }

    return;
}



function endProgram() {
    console.log('Finished Program');
}

// Run Main
main();
