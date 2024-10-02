'use strict';

var fs = require('fs');
var http = require('http');
var logger = require('./logger').getLogger();
var parser = require('./parser');

function Servlet(conf) {
	this.host = conf.host;
	this.port = conf.port;
	this.path = conf.path;
}

Servlet.prototype.get = function(input, output, type, callback) {
	http.get({host: this.host, port: this.port, path: (this.path + type + '/' + input)}, function(res) {
	  res.setEncoding('binary');
	  var data = "";
	  res.on('data', function(chunk) {
	  	data += chunk;
	  });
	  res.on('end', function() {
	  	fs.writeFile(output, data, 'binary', function(err) {
	  		if(err) {
	  			logger.warn(err);
	  			callback({message: 'Problem with saving result'});
	  		} else {
	  			logger.debug('Diagram saved to file %s', output);
	  			callback(null);	
	  		}
	  	});
	  	logger.debug('No more data in response');
	  });
	}).on('error', callback);
}

Servlet.prototype.check = function(input, callback) {
	http.get({host: this.host, port: this.port, path: (this.path + 'txt/' + input)}, function(res) {
		var data = "";
	  res.on('data', function(chunk) {
	  	data += chunk;
	  });
	  res.on('end', function() {
	  	const errLine = parser.checkError(data);
	  	if(errLine >= 0) {
	  		logger.warn('Compilation issue %d', errLine);
	  		callback({message: 'Generation Error', line: errLine});
	  	} else {
	  		callback(null);
	  	}
	  });
	}).on('error', callback);
}

module.exports = Servlet;