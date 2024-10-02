'use strict';

var log4js = require('log4js');

module.exports = new Logger();

function Logger() {
	this.logger = null;
}

module.exports.setLogger = function(logger) {
	this.logger = logger;
}

module.exports.getLogger = function() {
	if(this.logger === null) {
		this.logger = log4js.getLogger();
	}
	
	return this.logger;
}