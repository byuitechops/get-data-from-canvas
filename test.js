/*************************************************************
 * test.js
 *
 * This program tests out the package.json dependencies, so
 * that we know our program will run smoothly.
 *************************************************************/


// Module Declarations
var request = require('request'); // For various https requests
var fs = require('fs'); // For fs file-system module
var dsv = require('d3-dsv'); // For d3-dsv csv conversion node
var qs = require('qs');
var async = require('async');
var prompt = require('prompt');
var canvas = require('canvas-api-wrapper');
