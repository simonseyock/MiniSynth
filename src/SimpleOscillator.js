// #ifndef __SIMPLEOSCILLATOR__
// #define __SIMPLEOSCILLATOR__

// #include "init.js"
// #include "Instrument.js"

synth.instrument = synth.instrument || {};

/**
 *	Can only play one sound at a time (no chords possible)
 */
synth.instrument.SimpleOscillator = function (audioContext) {
	synth.instrument.Instrument.call(this);
	
	this.oscillator_ = audioContext.createOscillator();
	this.oscillator_.start();
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;
	
	this.oscillator_.connect(this.gain_);
};
synth.inherits(synth.instrument.SimpleOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.SimpleOscillator", synth.instrument.SimpleOscillator);

synth.instrument.SimpleOscillator.prototype.playFrequency = function (frequency, time, duration) {
	this.oscillator_.frequency.setValueAtTime(frequency, time);
	this.gain_.gain.setValueAtTime(1, time);
	this.gain_.gain.setValueAtTime(0, time+duration);	
};

synth.instrument.SimpleOscillator.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
	this.gain_.connect(anAudioNode);
};

// #endif