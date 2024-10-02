'use strict';

const reSyntaxError = /\s*Syntax [Ee]{1}rror(?:\?|:)[\s\S]*$/;
const reSkipping = /^\.{3}\s+\(skipping (\d+) line/;
const reEol = /\r?\n/;

function skipped(data) {
	if(data.startsWith('@startuml')) {
		return 0;
	} else {
		const match = reSkipping.exec(data);
		return match ? (parseInt(match[1])-1) : 0;
	}
}

exports.checkError = function(data) {
	if(reSyntaxError.exec(data)) {
		const lines = data.trim().split(reEol);
		const skip = skipped(lines[0]);
		return lines.length + skip - 3;
	}
	return -1;
}