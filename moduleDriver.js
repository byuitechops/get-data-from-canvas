var myModule = require('./review-comments-module.js');

var fs = require('fs');

function main() {
  // load the settings
  var settings = loadSettings();
  
  // pass the settings to my module
  myModule(settings);
}

function loadSettings() {
  var exampleSettingsJson = fs.readFileSync('settings.json', 'utf8');
  console.log(exampleSettingsJson);
  var exampleSettings = JSON.parse(exampleSettingsJson)
  console.log(exampleSettings);

  return exampleSettings;
}

main();