var prompt = require('prompt');
var fs = require('fs');

function main() {
  console.log('Welcome to the program!');

  var startProgramDecision = 'false';

  while (startProgramDecision === 'false') {
    // Load the settings
    var loadedSettings = loadSettings();

    // Prompt if user would like to change settings
    var changeSettingsDecision = promptChangeSettings();

    if (changeSettingsDecision === 'yes') {
      promptSettings(loadedSettings);
    } else {
      console.log('Ending Program...');
    }

    // Update the starting program decision
    startProgramDecision = promptStartProgram();
  }
  
  // Run the program!
}

function loadSettings() {
  var exampleSettingsJson = fs.readFileSync('settings.json', 'utf8');
  console.log(exampleSettingsJson);
  var exampleSettings = JSON.parse(exampleSettingsJson)
  console.log(exampleSettings);

  return exampleSettings;
}

function promptChangeSettings() {
  // This is our prompt with which we will prompt the user if they would like to change the settings
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
    //console.log('I received: ' + response.programResponse);
    return response;
  });
}

function promptStartProgram() {
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
    return response;
  });
}


function promptSettings(exampleSettings) {
  prompt.get(exampleSettings, function (error, response) {
    // Save the values that we have set to be the new defaults
    exampleSettings.properties.requestUrl.default = response.requestUrl;
    exampleSettings.properties.sendHappy.default = response.sendHappy;
    exampleSettings.properties.requestToken.default = response.requestToken;

    // Save the settings that were changed, if any
    saveSettings(exampleSettings);
  });
}

function saveSettings(exampleSettings) {
  var strungSettings = JSON.stringify(exampleSettings)
  fs.writeFileSync('settings.json', strungSettings);

  var jsonResponse = JSON.stringify(response);
  fs.writeFileSync('settingsChanges.txt', jsonResponse)
}
