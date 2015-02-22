// #ifndef __CLOCK__
// #define __CLOCK__

// #include "init.js"
// #include "StateExchangeObject.js"

synth.Clock = function () {
	this.setBpm(120);
	//this.on("statechange:bpm", ...);
	//this.setBeats(4);
	//this.setNoteValue(4);

	this.startTime_ = 0;
	this.started_ = false;
};
synth.inherits(synth.Clock, synth.stateExchangeObject);

synth.Clock.prototype.setBpm = function (bpm) {
	this.bpm_ = bpm;
	this.setState("bpm", bpm);
};

// synth.Clock.prototype.setNoteValue = function (noteValue) {
	// this.noteValue_ = noteValue;
	// this.setState("noteValue", noteValue);
// };

// synth.Clock.prototype.setBeats = function (beats) {
	// this.beats_ = beats;
	// this.setState("beats", beats);
// };

synth.Clock.prototype.start = function (/* time here? */) {
	this.started = true;
	this.startTime_ = Date.now();
	// fire start
};

synth.Clock.prototype.stop = function (/* time here? */) {
	this.started = false;
	// fire stop
};

// synth.Clock.prototype.bars2beats = function (bars) {
	
// };

// synth.Clock.prototype.beats2bars = function (beats) {

// };

synth.Clock.prototype.calcTime = function (beats) {
	return this.startTime_ + beats / this.bpm_ * 60 * 1000;
};

// #endif