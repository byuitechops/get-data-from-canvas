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
var reviewTimeAndComments = require('./review-comments-module.js');

/**
 * The main driving function of the program.
 * It first welcomes the user and then continues to prompt the user
 * if the settings should be changed before the actual conversion
 * module is run.
 * 
 * @author Scott Nicholes
 */
function main() {
  console.log('Welcome to the program!');
  
  async.waterfall([
    loadSettings,
    promptSettings,
    saveSettings,
    promptStartProgram
  ], function (error, result, response) {
    console.log('async performed successfully');
    console.log(result);

    if (response === 'yes' || error === 'run_with_no_changes') {
      // Run the program
      reviewTimeAndComments(result);
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
  var exampleSettingsJson = fs.readFileSync('settings.json', 'utf8');
  var exampleSettings = JSON.parse(exampleSettingsJson)

  // Display the current settings to the user
  console.log('Request Url: ' + exampleSettings.properties.requestUrl.default);
  console.log('Course ID: ' + exampleSettings.properties.course_id.default);
  console.log('Assignment ID: ' + exampleSettings.properties.assignment_id.default);
  console.log('Request Token: ' + exampleSettings.properties.requestToken.default);

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
      callback(null, exampleSettings);
    } else {
      // Send the error flag to run with no changes along with the current settings
      callback('run_with_no_changes', exampleSettings);
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
    settings.properties.requestToken.default = response.requestToken;
    settings.properties.assignment_id.default = response.assignment_id;

    callback(null, response, exampleSettings); 
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
  console.log(settings);

  // Prompt the user
  prompt.get(startProgramPrompt, function (error, response) {
    callback(null, settings, response.startProgram);
  });
}

// Run Main
main();