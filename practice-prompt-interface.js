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
  ], function(error, result) {
    console.log('async performed successfully');
    console.log(result);
    
    // Run the program
    myModule(result);
  });
}

function loadSettings(callback) {
  var exampleSettingsJson = fs.readFileSync('settings.json', 'utf8');
  console.log(exampleSettingsJson);
  var exampleSettings = JSON.parse(exampleSettingsJson)
  console.log(exampleSettings);

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
    console.log(response);
    if (response.changeSettings === 'yes') {
      console.log('about to call promptSettings');
      callback(null, exampleSettings);
    } else {
      callback();
    }
  });
}

function promptChangeSettings(callback) {
  // This is our prompt with which we will prompt the user if they would like to change the settings
  /*var changeSettingsPrompt = {
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
    //console.log('I received: ' + response.programResponse);
    //return response;

    if (response === 'yes') {
      return;
    } else {
      return callback(response);
    }
  });*/
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

  prompt.get(startProgramPrompt, function (error, response) {
    callback(null, settings);
  });
}


function promptSettings(exampleSettings, callback) {
  prompt.get(exampleSettings, function (error, response) {
    // Save the values that we have set to be the new defaults
    exampleSettings.properties.requestUrl.default = response.requestUrl;
    exampleSettings.properties.course_id.default = response.course_id;
    exampleSettings.properties.requestToken.default = response.requestToken;
    exampleSettings.properties.assignment_id.default = response.assignment_id;
    
    console.log(response);

    console.log('About to call save settings');
    callback(null, response, exampleSettings); // ASYNC:  For next function: saveSettings
    
    // Save the settings that were changed, if any
    //saveSettings(exampleSettings);
  });
}

function saveSettings(loadedSettings, exampleSettings, callback) {
  var strungSettings = JSON.stringify(exampleSettings)
  fs.writeFileSync('settings.json', strungSettings);
  
  var jsonResponse = JSON.stringify(loadedSettings);
  fs.writeFileSync('settingsChanges.txt', jsonResponse);
  
  console.log('About to call startProgramPrompt');
  callback(null, exampleSettings);
}

// Run Main
main();
