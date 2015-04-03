// #ifndef __GAINMODULE__
// #define __GAINMODULE__

// #include "Module.js"

/**
 *
 */

synth.instrument.module.Gain = function (audioContext) {
	synth.instrument.module.Module.call(this, audioContext);

  this.gainNode_ = audioContext.createGain();
};
synth.inherits(synth.instrument.module.Gain, synth.instrument.module.Module);
//synth.StateExchange.addType("synth.instrument.MultiVoiceOscillator", synth.instrument.MultiVoiceOscillator);

synth.instrument.module.Gain.prototype.setGain = function (gain) {
  this.gainNode_.gain.value = gain;
};

synth.instrument.module.Gain.prototype.getGain = function () {
  return this.gain_.gain.value;
};

synth.instrument.module.Gain.prototype.getNode = function () {
  return this.gainNode_;
};

synth.instrument.module.Gain.prototype.connect = function (aNode) {
  this.gainNode_.connect(aNode);
};

// #endif
