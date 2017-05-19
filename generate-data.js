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

    // Perform Waterfall Chain of Async operations
    async.waterfall([
    loadSettings,
    promptSettings,
    saveSettings,
    promptStartProgram
  ], function (error, result, response) {
        if (response === 'yes' || error === 'run_with_no_changes') {
            // Run the program
            console.log('');

            var props = result.properties;

            async.waterfall([
                function (callback) {
                    reviewTimeAndComments(result);
                    callback();
                },
                function (callback) {
                    quizConverter(props.requestToken.default, props.course_id.default, props.requestUrl.default);
                    callback();
                },
                function (callback) {
                    pageViews(result);
                    callback();
                }
            ], function (err, result) {
                endProgram();
            });


            return;
        } else {
            console.log('Ending Program...');

            return;
        }
    });
}

/**
 * This function loads the current settings and then prompts the user if 
 * they would like to change the settings.
 * 
 * @param {function} callback The next function in the Waterfall chain.
 * @author Scott Nicholes           
 */
function loadSettings(callback) {
    // Load the current settings from settings.json
    var settingsJson = fs.readFileSync('settings.json', 'utf8');
    var settings = JSON.parse(settingsJson);

    settings.properties.start_time.ask = function () {
        return prompt.history('runWithRange').value === 'yes'
    }
    settings.properties.end_time.ask = function () {
        return prompt.history('runWithRange').value === 'yes'
    }
    settings.properties.runWithRange.pattern = /^(?:yes\b|no\b)/

    console.log(settings.properties.runWithRange.pattern);

    // Display the current settings to the user
    console.log('Settings to run conversion program with:');
    console.log('Request Url: ' + settings.properties.requestUrl.default);
    console.log('Course ID: ' + settings.properties.course_id.default);
    console.log('Start Program with Time Range for Page Views: ' + settings.properties.runWithRange.default);
    console.log('Start Time For Page Views: ' + settings.properties.start_time.default);
    console.log('End Time For Page Views: ' + settings.properties.end_time.default);
    console.log('Request Token: ' + settings.properties.requestToken.default);
    console.log('');

    // Prompt body
    var changeSettingsPrompt = {
        properties: {
            changeSettings: {
                description: 'Do you want to change the settings?(yes/no)',
                type: 'string',
                pattern: /^(?:yes\b|no\b)/,
                message: 'Enter only \'yes\' or \'no\''
            }
        }
    }

    // Begin prompting user
    prompt.start();
    prompt.get(changeSettingsPrompt, function (error, response) {
        //console.log(response);
        if (response.changeSettings === 'yes') {
            // Continue the Waterfall to prompt the user for changes
            callback(null, settings);
        } else {
            // Send the error flag to run with no changes along with the current settings
            callback('run_with_no_changes', settings);
        }
    });
}

/**
 * Prompt the user to change the settings before the conversion modules
 * are run.
 * 
 * @param {Settings} settings The Settings to be changed or accepted.
 * @param {function} callback The next function in the Waterfall chain.
 *                            
 * @author Scott Nicholes
 */
function promptSettings(settings, callback) {
    prompt.get(settings, function (error, response) {
        // Save the values that we have set to be the new defaults
        settings.properties.requestUrl.default = response.requestUrl;
        settings.properties.course_id.default = response.course_id;
        settings.properties.start_time.default = response.start_time;
        settings.properties.end_time.default = response.end_time;
        settings.properties.requestToken.default = response.requestToken;
        settings.properties.runWithRange.default = response.runWithRange;

        callback(null, response, settings);
    });
}

/**
 * Save the settings that we just set.
 * 
 * @param {Settings} newSettings     The responses to the querys we made in promptSettings.
 * @param {Settings} defaultSettings The new defaults to be saved.
 * @param {function} callback        The next function in the Waterfall chain.
 */
function saveSettings(newSettings, defaultSettings, callback) {
    // Save new defaults
    var strungSettings = JSON.stringify(defaultSettings)
    fs.writeFileSync('settings.json', strungSettings);

    // Save new Settings.  Currently, we use the new default file.
    /*var jsonResponse = JSON.stringify(newSettings);
    fs.writeFileSync('settingsChanges.txt', jsonResponse);*/

    callback(null, defaultSettings);
}

/**
 * Prompt the user if they would like to start the conversion modules with the
 * current settings.
 * 
 * @param {Settings} settings The staged settings ready to be used to run the program.
 * @param {function} callback The last function to be called in the Waterfall chain.
 *                            
 * @author Scott Nicholes
 */
function promptStartProgram(settings, callback) {
    // Prompt body
    var startProgramPrompt = {
        properties: {
            startProgram: {
                description: 'Do you want to start the program with the current settings?(yes/no)',
                type: 'string',
                pattern: /^(?:yes\b|no\b)/,
                message: 'Enter only \'yes\' or \'no\''
            }
        }
    }

    // Display settings to the user
    console.log('\n');
    console.log('Request Url: ' + settings.properties.requestUrl.default);
    console.log('Course ID: ' + settings.properties.course_id.default);
    console.log('Start Program with Time Range for Page Views: ' + settings.properties.runWithRange.default)
    console.log('Start Time For Page Views: ' + settings.properties.start_time.default);
    console.log('End Time For Page Views: ' + settings.properties.end_time.default);
    console.log('Request Token: ' + settings.properties.requestToken.default);

    // Prompt the user
    prompt.get(startProgramPrompt, function (error, response) {
        callback(null, settings, response.startProgram);
    });
}

function endProgram(success) {
    console.log('Finished Program...')
}

// Run Main
main();
