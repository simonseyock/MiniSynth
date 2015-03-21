// #ifndef __SIMPLEOSCILLATOR__
// #define __SIMPLEOSCILLATOR__

// #include "Instrument.js"
// #include "TimeGate.js"

synth.instrument = synth.instrument || {};

/**
 *	Can only play one sound at a time (no chords possible)
 */
synth.instrument.SingleVoiceOscillator = function (audioContext, waveType, opt_scale) {
	synth.instrument.Instrument.call(this, audioContext, opt_scale);
	
	this.audioContext_ = audioContext;
	
	this.oscillator_ = audioContext.createOscillator();
	this.oscillator_.type = waveType;
	//this.oscillator_.start();
	this.timeGate_ = new synth.TimeGate(audioContext);
	
	this.oscillator_.connect(this.timeGate_.getNode());
	
	this.frequenciesToPlay.on("insert", function (timeObject) {
		this.timeGate_.addTime(timeObject);
		this.oscillator_.frequency.setValueAtTime(timeObject.value, timeObject.time);
	}.bind(this));
	
	this.frequenciesToPlay.on("remove", function (timeObject) {
		this.timeGate_.removeTime(timeObject);
	}.bind(this));
	
};
synth.inherits(synth.instrument.SingleVoiceOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.SingleVoiceOscillator", synth.instrument.SingleVoiceOscillator);

// synth.instrument.SingleVoiceOscillator.prototype.addFrequencies = function (frequencyCollection) {
	// var that = this;
	
	// //store
	// synth.instrument.Instrument.prototype.addFrequencies.call(this, frequencyCollection);
	
	// //play sound at given time
	// frequencyCollection.forEach(function (timeObject) {
		// that.oscillator_.frequency.setValueAtTime(timeObject.value, timeObject.time);
	// });
	
	// //adjust on/off
	// this.timeGate_.gate(frequencyCollection);
	
	// // -------------- old on/off
	// if ((index > 0) && (this.occupancy_[index-1].time + this.occupancy_[index-1].duration > time)) {
		// this.gain_.gain.setValueAtTime(1, this.occupancy_[index-1].time + this.occupancy_[index-1].duration);
	// } else {
		// this.gain_.gain.setValueAtTime(1, time);
	// }
		
	// if ((index+1 < this.occupancy_.length) && time + duration > this.occupancy_[index+1].time) {
		// // nothing to do ... stays 1
	// } else {
		// this.gain_.gain.setValueAtTime(0, time+duration);
	// }
	// // -------------- end on/off
	
	// //keep occupancy_ small
	// //var that = this;
	// //setTimeout(function () { that.occupancy_.shift(); }, (time - this.audioContext_.currentTime)*1000);
//};

// synth.instrument.SingleVoiceOscillator.prototype.isFree = function (time, duration) {
	// var index = 0;
	// var length = this.occupancy_.length;
	// while (index < length && time > this.occupancy_[index].time) {
		// index++;
	// }
	
	// if ((index > 0) && (this.occupancy_[index-1].time + this.occupancy_[index-1].duration > time)) {
		// return false;
	// } else if ((index < length) && time + duration > this.occupancy_[index].time) {
		// return false;
	// } else {
		// return true;
	// }
// };

synth.instrument.SingleVoiceOscillator.prototype.setWaveType = function (type) {
	this.oscillator_.type = type; // this probably causes problems during run time, we probably need to create a new oscillator then ...
};

synth.instrument.SingleVoiceOscillator.prototype.connect = function (anAudioNode) {
	this.timeGate_.connect(anAudioNode);
};

synth.instrument.SingleVoiceOscillator.prototype.start = function (when) {
	this.oscillator_.start(when);
};

synth.instrument.SingleVoiceOscillator.prototype.interrupt = function (when) {
	this.timeGate_.interrupt(when);
};

// #endif