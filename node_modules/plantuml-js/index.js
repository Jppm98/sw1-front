'use strict';

var async = require('async');

var encoder = require('./src/encoder');
var logger = require('./src/logger');
var Servlet = require('./src/servlet');

function PlantUml(conf) {
	logger.setLogger(conf.logger);
	this.servlet = new Servlet(conf.servlet);
}

PlantUml.prototype.png = function(input, output, callback) {
	var that = this;
	const encoded = encoder.encode('\'\n\'\n\'\n' + input);
	async.parallel([
      function(cb) { that.servlet.check(encoded, cb) },
      function(cb) { that.servlet.get(encoded, output, 'png', cb) }
	  ],
	  callback
	);
}

PlantUml.prototype.svg = function(input, output, callback) {
	this.servlet.get(encoder.encode(input), output, 'svg', callback);
}

module.exports = PlantUml;