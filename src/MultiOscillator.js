// #ifndef __MULTIOSCILLATOR__
// #define __MULTIOSCILLATOR__

// #include "init.js"
// #include "Instrument.js"
// #include "SimpleOscillator.js"

synth.instrument = synth.instrument || {};

/**
 *	Can play multiple sounds at a time
 */
synth.instrument.MultiOscillator = function (audioContext, waveType, numVoices) {
	synth.instrument.Instrument.call(this);
	
	this.audioContext_ = audioContext;

	this.gain_ = audioContext.createGain();
	
	this.waveType_ = waveType || "sine";
	
	this.setVoices(numVoices || 1);
};
synth.inherits(synth.instrument.MultiOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.MultiOscillator", synth.instrument.MultiOscillator);

synth.instrument.MultiOscillator.prototype.setVoices = function (numVoices) {
	this.numVoices_ = numVoices;
	this.simpleOscillators_ = [];
	for(var i=0; i<numVoices; i++) {
		var osc = new synth.instrument.SimpleOscillator(this.audioContext_, this.waveType_);
		this.simpleOscillators_.push(osc);
		osc.connect(this.gain_);
	}
};

synth.instrument.MultiOscillator.prototype.setWaveType = function (type) {
	this.waveType_ = type;
};

synth.instrument.MultiOscillator.prototype.playFrequency = function (frequency, time, duration) {
	var abort = false;
	//console.log("time:",time);
	for (var i=0; i<this.numVoices_ && !abort; i++) {
		//console.log("osc:",i);
		if (this.simpleOscillators_[i].isFree(time, duration)) {
			//console.log("is free");
			this.simpleOscillators_[i].playFrequency(frequency, time, duration);
			abort = true;
		}
	}
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