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
var Canvas = require('../../canvas-api-wrapper')
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
	canvas = new Canvas(settings.properties.requestToken.default, settings.properties.requestUrl.default)

	call(`courses/${settings.properties.course_id.default}/students`, function (students) {
		// Students should be an Array
		console.log(students);

		// Loop through all the students
		students.forEach(function (student) {
			call(`users/${student.id}/page_views`, function (pageViews) {
				var newPageViews = savePageViews(pageViews);

				if (newPageViews === null) {
					endProgram(false);
					return;
				} else {
					convertArrayToCsv(newPageViews, settings);
					endProgram(true);
					return;
				}
			});
		});
	});
}

function call(apiCall,callback) {
	canvas.call(apiCall).then(callback).catch(console.error)
}

function endProgram(success) {
	if (success) {
		console.log('');
		console.log('Program ended successfully');
		return;
	} else {
		console.log('');
		console.log('Program ended with errors');
		return;
	}
}


/**
 * This function generates the appropriate GET request URL,
 * based upon the settings.
 * 
 * @param   {Settings} settings The object that has the components needed to generate a request URL.
 * @returns {String}   The request URL.
 *                     
 * @author Scott Nicholes                    
 */

//users/${props.student_id.default}/page_views
function generateUrl(settings, apiCall) {
	// Core URL to get a Submission Object
	var props = settings.properties
	var url = `https://${props.requestUrl.default}.instructure.com/api/v1/${apiCall}/?access_token=${props.requestToken.default}`;
	return url;
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

	console.log(parsedBody);

	if (!Array.isArray(parsedBody)) {
		console.error('User is not Admin');
		return null;
	}

	parsedBody.forEach(function (pageViewObject) {
		var newPageView = {
			student_id: pageViewObject.links.user,
			url: pageViewObject.url,
			timestampAccess: pageViewObject.created_at,
			timeSpent: pageViewObject.interaction_seconds
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
function convertArrayToCsv(arrayOfPageViews, settings) {
	// Format the data into CSV
	var pageViewsCsv = dsv.csvFormat(arrayOfPageViews);

	// Write out the CSV file for a certain assignment_id
	fs.writeFileSync('PageViews for Student' + settings.properties.student_id.default+'.csv', pageViewsCsv);
	console.log('Wrote Page Views Module');
}

// Export this module
module.exports = main;
