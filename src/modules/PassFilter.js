// #ifndef __PASSFILTERMODULE__
// #define __PASSFILTERMODULE__

// #include "Module.js"
// #include "Amount.js"

/**
 *
 */

synth.module.PassFilter = function (audioContext, opt_options) {
  opt_options = opt_options || {};

	synth.module.Module.call(this, audioContext, opt_options);

  this.filter_ = this.audioContext_.createBiquadFilter();
  //this.filter_.frequency.value = 350;
  //this.filter_.Q.value = 1;

  this.amount_ = new synth.module.Amount(this.audioContext_, { amount:0 });
  this.amount_.biConnectWetChain(this.filter_, this.filter_);

  this.input = this.output = this.amount_;
};
synth.inherits(synth.module.PassFilter, synth.module.Module);
//synth.StateExchange.addType("synth.MultiVoiceOscillator", synth.MultiVoiceOscillator);

/* Type is either "lowpass", "highpass" or "bandpass" */
synth.module.PassFilter.prototype.getType = function () {
  return this.filter_.type;
};

synth.module.PassFilter.prototype.setType = function (type) {
  this.filter_.type = type;
};

synth.module.PassFilter.prototype.getFrequency = function () {
  return this.filter_.frequency.value;
};

synth.module.PassFilter.prototype.setFrequency = function (frequency) {
  this.filter_.frequency.value = frequency;
};

synth.module.PassFilter.prototype.getResonance = function () {
  return this.filter_.Q.value;
};

synth.module.PassFilter.prototype.setResonance = function (resonance) {
  this.filter_.Q.value = resonance;
};

synth.module.PassFilter.prototype.getAmount = function () {
  return this.amount_.getAmount();
};

synth.module.PassFilter.prototype.setAmount = function (amount) {
  return this.amount_.setAmount(amount);
};

// #endif
