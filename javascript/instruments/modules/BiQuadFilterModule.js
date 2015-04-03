// #ifndef __FILTERMODULE__
// #define __FILTERMODULE__

// #include "Module.js"

/**
 *
 */

synth.instrument.module.Filter = function (audioContext) {
	synth.instrument.module.Module.call(this, audioContext);
};
synth.inherits(synth.instrument.module.Filter, synth.instrument.module.Module);
//synth.StateExchange.addType("synth.instrument.MultiVoiceOscillator", synth.instrument.MultiVoiceOscillator);

synth.instrument.module.Filter.prototype.setFrequency = function (frequency) {
  this.frequency_ = frequency;
};

synth.instrument.module.Filter.prototype.getFrequency = function () {
  return this.frequency_;
};

synth.instrument.module.Filter.prototype.setResonance = function (resonance) {
  this.resonance_ = resonance;
};

synth.instrument.module.Filter.prototype.getResonance = function () {
  return this.resonance_;
};

synth.instrument.module.Filter.prototype.setType = function (type) {
  this.type_ = type;
};

synth.instrument.module.Filter.prototype.getType = function () {
  return this.type_;
};

synth.instrument.module.Filter.prototype.setAmount = function (amount) {
  this.amount_ = amount;
};

synth.instrument.module.Filter.prototype.getAmount = function () {
  return this.amount_;
};

// #endif
