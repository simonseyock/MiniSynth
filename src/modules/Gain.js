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

  this.registerEventType("change:gain");

  this.setGain = synth.makeChangeFiringSetter(synth.module.Gain, function (gain) {
    this.gainNode_.gain.value = gain;
    this.fireEvent("change:gain", [gain]);
  };
};
synth.inherits(synth.module.Gain, synth.module.Module);

synth.module.Gain.prototype.setGain = synth.placeholder;

synth.module.Gain.prototype.getGain = function () {
  return this.gainNode_.gain.value;
};

synth.module.Gain.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.gain = this.getGain();
  return state;
};

synth.module.Gain.prototype.setState = function (state) {
  synth.module.Module.prototype.getState.call(this, state);
  this.setGain(state.gain);
};
// #endif
