// #ifndef __SIMPLEOSCILLATOR__
// #define __SIMPLEOSCILLATOR__

// #include "init.js"
// #include "Instrument.js"

synth.instrument = synth.instrument || {};

/**
 *	Can only play one sound at a time (no chords possible)
 */
synth.instrument.SimpleOscillator = function (audioContext, waveType) {
	synth.instrument.Instrument.call(this);
	
	this.audioContext_ = audioContext;
	
	this.oscillator_ = audioContext.createOscillator();
	this.oscillator_.type = waveType;
	//this.oscillator_.start();
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;
	
	this.oscillator_.connect(this.gain_);
	
	this.occupancy_ = [];
};
synth.inherits(synth.instrument.SimpleOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.SimpleOscillator", synth.instrument.SimpleOscillator);

synth.instrument.SimpleOscillator.prototype.playFrequency = function (frequency, time, duration) {
	//store
	var index = this.occupancy_.length;
	while (index > 0 && time < this.occupancy_[index-1].time) {
		index--;
	}
	this.occupancy_.splice(index, 0, {time: time, duration: duration});

	
	//play sound at given time
	this.oscillator_.frequency.setValueAtTime(frequency, time);
	
	
	//adjust on/off
	if ((index > 0) && (this.occupancy_[index-1].time + this.occupancy_[index-1].duration > time)) {
		this.gain_.gain.setValueAtTime(1, this.occupancy_[index-1].time + this.occupancy_[index-1].duration);
	} else {
		this.gain_.gain.setValueAtTime(1, time);
	}
		
	if ((index+1 < this.occupancy_.length) && time + duration > this.occupancy_[index+1].time) {
		// nothing to do ... stays 1
	} else {
		this.gain_.gain.setValueAtTime(0, time+duration);
	}
	
	//keep occupancy_ small
	var that = this;
	setTimeout(function () { that.occupancy_.shift(); }, (time - this.audioContext_.currentTime)*1000);
};

synth.instrument.SimpleOscillator.prototype.isFree = function (time, duration) {
	var index = 0;
	var length = this.occupancy_.length;
	while (index < length && time > this.occupancy_[index].time) {
		index++;
	}
	
	if ((index > 0) && (this.occupancy_[index-1].time + this.occupancy_[index-1].duration > time)) {
		return false;
	} else if ((index < length) && time + duration > this.occupancy_[index].time) {
		return false;
	} else {
		return true;
	}
};

synth.instrument.SimpleOscillator.prototype.setWaveType = function (type) {
	this.oscillator_.type = type; // this probably causes problems during run time, we probably need to create a new oscillator then ...
};

synth.instrument.SimpleOscillator.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.instrument.SimpleOscillator.prototype.start = function (when) {
	this.oscillator_.start(when);
};

// #endif