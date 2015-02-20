// #include "init.js"

/**
 * Timecode signature: [ beats, notevalue ]
 * Timecode string format: "bars:1/notevalue:1/(notevalue*notevalue)" ... and so on
 * Internal normal represetation: array 
 */

synth.timecode = synth.timecode || {};

synth.timecode.timecode2number = function (timecode, signature) {

};

synth.timecode.number2timecode = function (number, signature) {
		
};

synth.timecode.add = function (timecode1, timecode2) {
	
	
};

synth.timecode.normalize = function (timecode, signature) {
	
};


synth.timecode.timecode2string = function (timecode) {
	return timecode.join(":");	
};

synth.timecode.string2timecode = function (string) {
	return string.split(":");
};