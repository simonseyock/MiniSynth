// #ifndef __AMOUNTMODULE__
// #define __AMOUNTMODULE__

// #include "Module.js"

synth.module.Amount = function (audioContext, opt_options) {
  synth.module.Module.call(this, audioContext, opt_options);
  opt_options = opt_options || {};

  this.wet_ = this.audioContext_.createGain();
  this.dry_ = this.audioContext_.createGain();

  this.set("amount", opt_options.amount || 0);

  this.input = this.audioContext_.createGain();
  this.input.connect(this.dry_);

  this.output = this.audioContext_.createGain();
  this.wet_.connect(this.output);
  this.dry_.connect(this.output);

  this.on("change:amount", this.onAmountChange);
};
synth.inherits(synth.module.Amount, synth.module.Module);

synth.module.Amount.prototype.biConnectWetChain = function (wetChainIn, wetChainOut) {
  this.input.connect(wetChainIn);
  wetChainOut.connect(this.wet_);
};

synth.module.Amount.prototype.onAmountChange = function (e) {
  this.wet_.gain.value = e.newValue;
  this.dry_.gain.value = 1 - e.newValue;
};

synth.module.Amount.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.amount = this.get("amount");
  return state;
};

synth.module.Amount.prototype.setState = function (state) {
  synth.module.Module.prototype.getState.call(this, state);
  this.set("amount", state.amount);
};

// #endif
