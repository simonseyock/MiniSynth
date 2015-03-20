// #ifndef __CLOCK__
// #define __CLOCK__

// #include "init.js"
// #include "StateExchangeObject.var.js"
// #include "ObservableObject.js"

// NOTE: Global Assumption: BpM is the Velocity of Quarters

// clock should fire events the say which bar starts next
// the listeners then get the real time from the clock, giving it a relative time (like 0.5 for a note at the middle of the bar.)
// this will for now only work for the next bar, not the current bar, but is not needed for the current bar anyways? maybe for inserting or removing ...

// only saves next bar start time and adjust this with tempo changes.
// maintains an intervall, timeout which fires half way before the next bar starts. gets adjusted with tempoChange, too

synth.Clock = function (audioContext) {
	synth.ObservableObject.call(this);
	
	this.registerEventType("nextBar");
	this.registerEventType("start");
	this.registerEventType("stop");
	this.registerEventType("tempoChange");
	//this.registerEventType("change:noteValues");
	//this.registerEventType("change:beats");
	
	this.audioContext_ = audioContext;
	
	this.bpm_ = 120;
	//this.setBpm(120);
	//this.on("statechange:bpm", ...);
	//this.setBeats(4);
	//this.setNoteValue(4);
	
	this.bufferTime_ = 0.05;
	this.precognitionTime_ = 0.3;
	//this.gridTime_ = 0.2;
	
	//this.startTime_ = 0;
	this.started = false;
	this.nextbar_ = 0;
	
};
synth.inherits(synth.Clock, synth.StateExchangeObject);
synth.inherits(synth.Clock, synth.ObservableObject);

synth.Clock.prototype.getBpM = function () {
	return this.bpm_;
};

/*
* 
* NOTE: whenability ...
*/
synth.Clock.prototype.setBpM = function (bpm) {

	//setTimeout( function () {
		
		var oldBpM = this.bpm_;
		var oldBarLength = this.getBarLength();
		
		this.bpm_ = bpm;
		
		if (this.started) {
			
			// if (when > this.nextBarTime_) {
				// // this only happens when the timeChange falls in the precognition interval
				// // causes a problem in calculation of the intervals and timeouts
				// var barTimeBeforeTimeChange = this.nextBarTime_;
				// //var correction = -1;
			// } else {
				var barTimeBeforeTimeChange = this.nextBarTime_ - oldBarLength;
			//}
			
			var oldTempoPart = (this.audioContext_.currentTime - barTimeBeforeTimeChange) / oldBarLength;
			var newTempoPart = 1 - oldTempoPart;
			
			// console.log("when: %f timeBefore: %f oldBarLength: %f newBarLength: %f oldNextBar: %f newNextBar: %f now: %f", 
				// when, barTimeBeforeTimeChange, oldBarLength, this.getBarLength(), this.nextBarTime_, when + (1 - oldTempoPart) * this.getBarLength(), this.audioContext_.currentTime);			
			
			this.nextBarTime_ = this.audioContext_.currentTime + (1 - oldTempoPart) * this.getBarLength(); 
			this.makeTicker();
		}
		
		this.fireEvent("tempoChange", [oldBpM/bpm]);
	//}.bind(this), (when-this.audioContext_.currentTime-this.precognitionTime_) * 1000);
	//this.setState("bpm", bpm);
};

// synth.Clock.prototype.setNoteValue = function (noteValue) {
	// var oldValue = this.noteValue_;
	// this.noteValue_ = noteValue;
	// this.fireEvent("change:noteValue", [{oldValue: oldValue, newValue: noteValue}]);
	// //this.setState("noteValue", noteValue);
// };

// synth.Clock.prototype.setBeats = function (beats) {
	// var oldValue = this.beats_;
	// this.beats_ = beats;
	// this.fireEvent("change:beats", [{oldValue: oldValue, newValue: beats}]);
	// //this.setState("beats", beats);
// };



// sketch

// synth.Clock.prototype.getRealTime = function (relativeTime) {
	// var bar = Math.floor(relativeTime);
// };

// synth.Clock.prototype.getRealTime = function (time) {
	// return this.startTime_ + this.bufferTime_ + time;
// };

synth.Clock.prototype.getBarLength = function () {
	return 60 / this.bpm_ * 4;
};

synth.Clock.prototype.start = function (when) {
	
	when = when || this.audioContext_.currentTime;
	
	this.fireEvent("start", [when]);
	
	this.fireEvent("nextBar", [ 0, when ] );
	
	this.nextBar_ = 1;
	this.nextBarTime_ = when + this.getBarLength();
	this.makeTicker(when);
	
	this.started = true;
	//this.startTime_ = this.audioContext_.currentTime;
};

synth.Clock.prototype.makeTicker = function () {
	clearInterval(this.ticker_);
	
	var loop = function () {
		this.fireEvent("nextBar", [this.nextBar_, this.nextBarTime_]);
		this.nextBar_++;
		this.nextBarTime_ += this.getBarLength();
		this.ticker_ = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.precognitionTime_) * 1000);
	}.bind(this);
	
	this.ticker_ = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.precognitionTime_) * 1000);
};

// NOTE: another possibility: makeTicker to when the tempo changes

synth.Clock.prototype.stop = function (when) {
	//clearInterval(this.informer_);
	setTimeout(function () {
		this.started = false;
	
		clearTimeout(this.ticker_);
	
		this.fireEvent("stop", [when]);
	}.bind(this), (when - this.audioContext_.currentTime) * 1000)
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

// synth.Clock.prototype.getBarLength = function () {
	// return this.beats_ / this.bpm_ * 60;
// };

// synth.Clock.prototype.calcTime = function (beats) {
	// return this.startTime_ + beats / this.bpm_ * 60 * 1000;
// };

// #endif