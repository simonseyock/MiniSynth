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

  this.set("type", this.filter_.type);
  this.set("frequency", this.filter_.frequency.value);
  this.set("resonance", this.filter_.Q.value);
  this.set("amount", 0);

  this.on("change:type", this.onTypeChange);
  this.on("change:frequency", this.onFrequencyChange);
  this.on("change:resonance", this.onResonanceChange);
  this.on("change:amount", this.onAmountChange);
};
synth.inherits(synth.module.PassFilter, synth.module.Module);

/* Type is either "lowpass", "highpass" or "bandpass" */
synth.module.PassFilter.prototype.onTypeChange = function (e) {
  this.filter_.type = e.newValue;
};

synth.module.PassFilter.prototype.onFrequencyChange = function (e) {
  this.filter_.frequency.value = e.newValue;
};

synth.module.PassFilter.prototype.onResonanceChange = function (e) {
  this.filter_.Q.value = e.newValue;
};

synth.module.PassFilter.prototype.onAmountChange = function (e) {
  this.amount_.set("amount", e.newValue);
};

synth.module.PassFilter.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.type = this.get("type");
  state.frequency = this.get("frequency");
  state.resonance = this.get("resonance");
  state.amount = this.get("amount");
  return state;
};

synth.module.PassFilter.prototype.setState = function (state) {
  synth.module.Module.prototype.setState.call(this, state);
  this.set("type", state.type);
  this.set("frequency", state.frequency);
  this.set("resonance", state.resonance);
  this.set("amount", state.amount);
};

// #endif
