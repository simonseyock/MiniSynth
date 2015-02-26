// #ifndef __MULTIOSCILLATOR__
// #define __MULTIOSCILLATOR__

// #include "init.js"
// #include "Instrument.js"
// #include "SimpleOscillator.js"

synth.instrument = synth.instrument || {};

/**
 *	Can play multiple sounds at a time
 */
synth.instrument.MultiOscillator = function (audioContext, waveType, numVoices, scale) {
	synth.instrument.Instrument.call(this, scale);
	
	this.audioContext_ = audioContext;

	this.gain_ = audioContext.createGain();
	
	this.waveType_ = waveType || "sine";
	
	this.setVoices(numVoices || 1);
	
	this.oscIndex_ = 0;
};
synth.inherits(synth.instrument.MultiOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.MultiOscillator", synth.instrument.MultiOscillator);

synth.instrument.MultiOscillator.prototype.setVoices = function (numVoices) {
	this.numVoices_ = numVoices;
	this.simpleOscillators_ = [];
	for(var i=0; i<numVoices; i++) {
		var osc = new synth.instrument.SimpleOscillator(this.audioContext_, this.waveType_, this.scale_);
		this.simpleOscillators_.push(osc);
		osc.connect(this.gain_);
	}
};

synth.instrument.MultiOscillator.prototype.setScale = function (scale) {
	for (var i=0; i<numVoices; i++) {
		this.simpleOscillators_[i].setScale(scale);
	}
};

synth.instrument.MultiOscillator.prototype.setWaveType = function (type) {
	this.waveType_ = type;
};

synth.instrument.MultiOscillator.prototype.playFrequency = function (frequency, time, duration) {
	
	//this variant of the mechanism does assume the values come in in the order they are played
	this.simpleOscillators_[this.oscIndex_].playFrequency(frequency, time, duration);
	
	this.oscIndex_ = (this.oscIndex_ + 1) % this.numVoices_;
	
	//console.log("time:",time);
	// for (var i=0, found=false; i<this.numVoices_ && !found; i++) {
		// //console.log("osc:",i);
		// if (this.simpleOscillators_[i].isFree(time, duration)) {
			// //console.log("is free");
			// this.simpleOscillators_[i].playFrequency(frequency, time, duration);
			// found = true;
		// }
	// }
	// if(!found) {
		// //interrupt a random oscillator at that time ... not that good, it's not the same sound anymore everytime you play it
		// this.simpleOscillators_[Math.rand()%this.numVoices_].playFrequency(frequency, time, duration);
	// }
};

synth.instrument.MultiOscillator.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.instrument.MultiOscillator.prototype.start = function (when) {
	for(var i=0; i<this.numVoices_; i++) {
		this.simpleOscillators_[i].start(when);
	}
};

// #endif