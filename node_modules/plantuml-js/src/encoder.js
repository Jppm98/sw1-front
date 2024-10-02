'use strict';

var zlib = require('zlib');
var logger = require('./logger').getLogger();

const BASE = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function append(b1, b2, b3) {
	let c1 = b1 >> 2;
	let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
	let c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
	let c4 = b3 & 0x3F;
	//logger.debug(b1, b2, b3, c1, c2, c3, c4);
	return (BASE[c1 & 0x3F] + BASE[c2 & 0x3F] + BASE[c3 & 0x3F] + BASE[c4 & 0x3F]);
}

exports.encode = function(input) {
	let data = zlib.deflateSync(input);
	let result = "";
	const len = data.length;
	for(var i = 0; i < len; i += 3) {
		result += append(data[i], ((i+1) < len) ? data[i+1] : 0,	((i+2) < len) ? data[i+2] : 0);
	}
	logger.debug(result);
	return result;
}
