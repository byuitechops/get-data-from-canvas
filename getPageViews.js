var request = require('request');
var https = require('https');
var fs = require('fs');
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node

var userId = process.argv[2];
var accessToken = process.argv[3];
var queryType = process.argv[4];

var arrayOfPageViews = [];

switch (queryType) {
  case 'page-views':
    var url = 'https://byui.instructure.com/api/v1/users/' + userId + '/page_views';
    break;

  case 'review-time':
    var url = 'https://byui.instructure.com/api/v1/'
}



// If there are parameters, get them
if (process.argv.length > 5) {
  for (var i = 5; i < process.argv.length; i++) {
    url += process.argv[i];
    url += '&';
  }
} else {
  url += '&'
}

url += 'access_token=';
url += accessToken;

console.log(url);

// Now, perform the get request
request.get(url, function (error, response, body) {
  arrayOfPageViews = saveBodyElements(body);
  convertArrayToCsv(arrayOfPageViews);
})

function saveBodyElements(body) {
  var parsedBody = JSON.parse(body);
  parsedBody.forEach(function (pageViewObject) {
    var newPageView = {
      student_id: '',
      url: '',
      timestampAccess: '',
      timeSpent: ''
    };

    newPageView.url = pageViewObject.url;
    newPageView.timeSpent = pageViewObject.interaction_seconds;
    newPageView.timestampAccess = pageViewObject.created_at;
    newPageView.student_id = pageViewObject.links.user;

    arrayOfPageViews.push(newPageView);
  });
}

function convertArrayToCsv(arrayOfPageViews) {
  var csvOut = dsv.csvFormat(arrayOfPageViews, ["Student_ID", "URL", "Date/Time Accessed", "Time Spent on Page"]);

  fs.writeFileSync('pageViewsByInstance.csv', csvOut);
}
