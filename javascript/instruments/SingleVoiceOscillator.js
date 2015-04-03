// #ifndef __SIMPLEOSCILLATOR__
// #define __SIMPLEOSCILLATOR__

// #include "Instrument.js"
// #include "Timer.js"

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

	this.timeGate_ = new synth.Timer(audioContext, this.frequenciesToPlay);

	this.oscillator_.connect(this.timeGate_.getNode());

	this.frequenciesToPlay.on("insert", function (timeObject) {
		this.oscillator_.frequency.setValueAtTime(timeObject.value, timeObject.time);
	}.bind(this));
};
synth.inherits(synth.instrument.SingleVoiceOscillator, synth.instrument.Instrument);
synth.StateExchange.addType("synth.instrument.SingleVoiceOscillator", synth.instrument.SingleVoiceOscillator);

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

synth.instrument.SingleVoiceOscillator.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);
  this.timeGate_.update(when);
};
// #endif
