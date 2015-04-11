// #ifndef __FILTERMODULE__
// #define __FILTERMODULE__

// #include "Module.js"

/**
 *
 */

synth.module.Filter = function (audioContext) {
	synth.module.Module.call(this, audioContext);
};
synth.inherits(synth.module.Filter, synth.module.Module);
//synth.StateExchange.addType("synth.MultiVoiceOscillator", synth.MultiVoiceOscillator);

synth.module.Filter.prototype.setFrequency = function (frequency) {
  this.frequency_ = frequency;
};

synth.module.Filter.prototype.getFrequency = function () {
  return this.frequency_;
};

synth.module.Filter.prototype.setResonance = function (resonance) {
  this.resonance_ = resonance;
};

synth.module.Filter.prototype.getResonance = function () {
  return this.resonance_;
};

synth.module.Filter.prototype.setType = function (type) {
  this.type_ = type;
};

synth.module.Filter.prototype.getType = function () {
  return this.type_;
};

synth.module.Filter.prototype.setAmount = function (amount) {
  this.amount_ = amount;
};

synth.module.Filter.prototype.getAmount = function () {
  return this.amount_;
};

// #endif
