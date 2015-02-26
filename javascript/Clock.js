// #ifndef __CLOCK__
// #define __CLOCK__

// #include "init.js"
// #include "StateExchangeObject.var.js"

synth.Clock = function (audioContext) {
	this.setBpm(120);
	//this.on("statechange:bpm", ...);
	this.setBeats(4);
	this.setNoteValue(4);

	this.audioContext_ = audioContext;
	
	this.bufferTime_ = 0.05;
	
	this.startTime_ = 0;
	this.started_ = false;
	
	this.players_ = [];
	this.informer_ = null;
};
synth.inherits(synth.Clock, synth.StateExchangeObject);

synth.Clock.prototype.setBpm = function (bpm) {
	this.bpm_ = bpm;
	//this.setState("bpm", bpm);
};

synth.Clock.prototype.setNoteValue = function (noteValue) {
	this.noteValue_ = noteValue;
	//this.setState("noteValue", noteValue);
};

synth.Clock.prototype.setBeats = function (beats) {
	this.beats_ = beats;
	//this.setState("beats", beats);
};

synth.Clock.prototype.start = function (/* time here? */) {
	var that = this;
	this.informer_ = setInterval( function () {
		that.informPlayers(that.audioContext_.currentTime + that.bufferTime_);
	}, this.getBarLength() * 1000);
	
	this.started = true;
	this.startTime_ = this.audioContext_.currentTime + this.bufferTime_;
	
	this.informPlayers(this.audioContext_.currentTime + this.bufferTime_);
};

synth.Clock.prototype.stop = function (/* time here? */) {
	clearInterval(this.informer_);
	this.started = false;
	// fire stop
};

synth.Clock.prototype.registerPlayer = function (player) {
	this.players_.push(player);
};

synth.Clock.prototype.informPlayers = function (when) {
	for (var i=0; i<this.players_.length; i++) {
		this.players_[i].playBar(when, this.getBarLength());
	}
};

// synth.Clock.prototype.bars2beats = function (bars) {
	
// };

// synth.Clock.prototype.beats2bars = function (beats) {

// };

synth.Clock.prototype.getBarLength = function () {
	return this.beats_ / this.bpm_ * 60;
};

// synth.Clock.prototype.calcTime = function (beats) {
	// return this.startTime_ + beats / this.bpm_ * 60 * 1000;
// };

// #endif