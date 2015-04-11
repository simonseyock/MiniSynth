// #ifndef __AMOUNTMODULE__
// #define __AMOUNTMODULE__

// #include "Module.js"

synth.module.Amount = function (audioContext, opt_options) {
  synth.module.Module.call(this, audioContext, opt_options);
  opt_options = opt_options || {};

  this.wet_ = this.audioContext_.createGain();
  this.dry_ = this.audioContext_.createGain();

  this.setAmount(opt_options.amount || 0);

  this.input = this.audioContext_.createGain();
  this.input.connect(this.dry_);

  this.output = this.audioContext_.createGain();
  this.wet_.connect(this.output);
  this.dry_.connect(this.output);
};
synth.inherits(synth.module.Amount, synth.module.Module);

synth.module.Amount.prototype.biConnectWetChain = function (wetChainIn, wetChainOut) {
  this.input.connect(wetChainIn);
  wetChainOut.connect(this.wet_);
};

synth.module.Amount.prototype.setAmount = function (amount) {
  this.amount_ = amount;
  this.wet_.gain.value = amount;
  this.dry_.gain.value = 1 - amount;
};

synth.module.Amount.prototype.getAmount = function () {
  return this.amount_;
};

// #endif
