var prompt = require('prompt');
var fs = require('fs');
var async = require('async');
var myModule = require('./review-comments-module.js');


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
      myModule(result);
      return;
    } else {
      console.log('Ending Program...');
      return;
    }
  });
}


function loadSettings(callback) {
  var exampleSettingsJson = fs.readFileSync('settings.json', 'utf8');
  var exampleSettings = JSON.parse(exampleSettingsJson)

  // Display the current settings to the user
  console.log('Request Url: ' + exampleSettings.properties.requestUrl.default);
  console.log('Course ID: ' + exampleSettings.properties.course_id.default);
  console.log('Assignment ID: ' + exampleSettings.properties.assignment_id.default);
  console.log('Request Token: ' + exampleSettings.properties.requestToken.default);

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

  prompt.start();
  prompt.get(changeSettingsPrompt, function (error, response) {
    //console.log(response);
    if (response.changeSettings === 'yes') {
      console.log('about to call promptSettings');
      callback(null, exampleSettings);
    } else {
      callback('run_with_no_changes', exampleSettings);
    }
  });
}

function promptStartProgram(settings, callback) {
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

  // Display current settings to the user
  console.log(settings);

  prompt.get(startProgramPrompt, function (error, response) {
    callback(null, settings, response.startProgram);
  });
}


function promptSettings(exampleSettings, callback) {
  prompt.get(exampleSettings, function (error, response) {
    // Save the values that we have set to be the new defaults
    exampleSettings.properties.requestUrl.default = response.requestUrl;
    exampleSettings.properties.course_id.default = response.course_id;
    exampleSettings.properties.requestToken.default = response.requestToken;
    exampleSettings.properties.assignment_id.default = response.assignment_id;

    // ASYNC:  For next function: saveSettings
    callback(null, response, exampleSettings); 
  });
}

function saveSettings(loadedSettings, exampleSettings, callback) {
  // Save new defaults
  var strungSettings = JSON.stringify(exampleSettings)
  fs.writeFileSync('settings.json', strungSettings);

  // Save new Settings.  Currently, we use the new default file.
  /*var jsonResponse = JSON.stringify(loadedSettings);
  fs.writeFileSync('settingsChanges.txt', jsonResponse);*/

  callback(null, exampleSettings);
}

// Run Main
main();