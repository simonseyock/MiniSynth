// #ifndef __CLOCK__
// #define __CLOCK__

// #include "init.js"
// #include "StateExchangeObject.var.js"
// #include "EventHandling.js"

synth.Clock = function (audioContext) {
	synth.EventHandling.call(this);
	
	this.setBpm(120);
	//this.on("statechange:bpm", ...);
	this.setBeats(4);
	this.setNoteValue(4);

	this.audioContext_ = audioContext;
	
	this.bufferTime_ = 0.05;
	this.precognitionTime_ = 0.1;
	this.gridTime_ = 0.2;
	
	this.startTime_ = 0;
	this.started_ = false;
	
	this.tickerI_ = null;
	this.tickerT_ = null;
	
	this.registerEventType("tick"); // gives relative times to startTime
	this.registerEventType("start");
	this.registerEventType("stop");
};
synth.inherits(synth.Clock, synth.StateExchangeObject);
synth.inherits(synth.Clock, synth.EventHandling);

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
	
	this.fireEvent("start", [0]);
	
	this.fireEvent("tick", [ 0, this.gridTime_ ] );
	this.tickCount_ = 1;
	
	var that = this;
	
	that.tickerT_ = setTimeout( function () {
		that.fireEvent("tick", [that.gridTime_, 2* that.gridTime_]);
		that.tickCount_++;
		that.tickerI_ = setInterval( function () {
			that.fireEvent("tick", [that.gridTime_ * that.tickCount_, that.gridTime_ * (that.tickCount_ + 1)]);
			that.tickCount_++;
		}, that.gridTime_ * 1000);
	}, (this.gridTime_-this.precognitionTime_) * 1000);
	
	this.started = true;
	this.startTime_ = this.audioContext_.currentTime;
};

synth.Clock.prototype.stop = function (/* time here? */) {
	//clearInterval(this.informer_);
	this.started = false;
	
	clearTimeout(this.tickerT_);
	clearInterval(this.tickerI_);
	
	this.fireEvent("stop", [this.audioContext_.currentTime - this.startTime_]);
};

synth.Clock.prototype.getRealTime = function (time) {
	return this.startTime_ + this.bufferTime_ + time;
};

// synth.Clock.prototype.registerPlayer = function (player) {
	// this.players_.push(player);
// };

// synth.Clock.prototype.informPlayers = function (when) {
	// for (var i=0; i<this.players_.length; i++) {
		// this.players_[i].playBar(when, this.getBarLength());
	// }
// };

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