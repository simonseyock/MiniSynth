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

  this.set("gain", opt_options.gain || 1);

  this.input = this.output = this.gainNode_;

  this.on("change:gain", function (e) {
    this.gainNode_.gain.value = e.newValue;
  }.bind(this));
};
synth.inherits(synth.module.Gain, synth.module.Module);


synth.module.Gain.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.gain = this.get("gain");
  return state;
};

synth.module.Gain.prototype.setState = function (state) {
  synth.module.Module.prototype.getState.call(this, state);
  this.set("gain", state.gain);
};
// #endif
