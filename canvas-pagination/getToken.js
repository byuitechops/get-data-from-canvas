/*eslint-env node*/
var fs = require('fs');

module.exports = (function (fileName) {
    var fileObj = JSON.parse(fs.readFileSync(fileName, 'utf8'))
    return fileObj.token;
});
