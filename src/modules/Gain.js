// #ifndef __GAINMODULE__
// #define __GAINMODULE__

// #include "Module.js"

/**
 *
 */

synth.module.Gain = function (audioContext, opt_options) {
  opt_options = opt_options || {};

	synth.module.Module.call(this, audioContext, opt_options);

  this.gainNode_ = audioContext.createGain();

  this.setGain(opt_options.gain || 1);

  this.input = this.output = this.gainNode_;
};
synth.inherits(synth.module.Gain, synth.module.Module);
//synth.StateExchange.addType("synth.MultiVoiceOscillator", synth.MultiVoiceOscillator);

synth.module.Gain.prototype.setGain = function (gain) {
  this.gainNode_.gain.value = gain;
};

synth.module.Gain.prototype.getGain = function () {
  return this.gainNode_.gain.value;
};

// #endif
