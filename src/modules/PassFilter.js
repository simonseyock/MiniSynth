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

  this.registerEventType("change:type");
  this.registerEventType("change:frequency");
  this.registerEventType("change:resonance");
  this.registerEventType("change:amount");
};
synth.inherits(synth.module.PassFilter, synth.module.Module);

/* Type is either "lowpass", "highpass" or "bandpass" */
synth.module.PassFilter.prototype.getType = function () {
  return this.filter_.type;
};

synth.module.PassFilter.prototype.setType = function (type) {
  this.filter_.type = type;
  this.fireEvent("change:type", [type]);
};

synth.module.PassFilter.prototype.getFrequency = function () {
  return this.filter_.frequency.value;
};

synth.module.PassFilter.prototype.setFrequency = function (frequency) {
  this.filter_.frequency.value = frequency;
  this.fireEvent("change:frequency", [frequency]);
};

synth.module.PassFilter.prototype.getResonance = function () {
  return this.filter_.Q.value;
};

synth.module.PassFilter.prototype.setResonance = function (resonance) {
  this.filter_.Q.value = resonance;
  this.fireEvent("change:resonance", [resonance]);
};

synth.module.PassFilter.prototype.getAmount = function () {
  return this.amount_.getAmount();
};

synth.module.PassFilter.prototype.setAmount = function (amount) {
  return this.amount_.setAmount(amount);
  this.fireEvent("change:amount", [amount]);
};

synth.module.PassFilter.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.type = this.getType();
  state.frequency = this.getFrequency();
  state.resonance = this.getResonance();
  state.amount = this.getAmount();
  return state;
};

synth.module.PassFilter.prototype.setState = function (state) {
  synth.module.Module.prototype.setState.call(this, state);
  this.setType(state.type);
  this.setFrequency(state.frequency);
  this.setResonance(state.resonance);
  this.setAmount(state.amount);
};

// #endif
