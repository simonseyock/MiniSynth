// #ifndef __LOWPASSFILTERMODULE__
// #define __LOWPASSFILTERMODULE__

// #include "Module.js"

/**
 *
 */

synth.instrument.module.LowpassFilter = function (audioContext) {
	synth.instrument.module.Module.call(this, audioContext);

  this.filter_ = audioContext.createBiquadFilter();
  //this.filter_.frequency.value = 350;
  //this.filter_.Q.value = 1;
};
synth.inherits(synth.instrument.module.LowpassFilter, synth.instrument.module.Module);
//synth.StateExchange.addType("synth.instrument.MultiVoiceOscillator", synth.instrument.MultiVoiceOscillator);

synth.instrument.module.LowpassFilter.prototype.setFrequency = function (frequency) {
  this.filter_.frequency.value = frequency;
};

synth.instrument.module.LowpassFilter.prototype.getFrequency = function () {
  return this.filter_.frequency.value;
};

synth.instrument.module.LowpassFilter.prototype.setResonance = function (resonance) {
  this.filter_.Q.value = resonance;
};

synth.instrument.module.LowpassFilter.prototype.getResonance = function () {
  return this.filter_.Q.value;
};

synth.instrument.module.LowpassFilter.prototype.getNode = function () {
  return this.filter_;
};

synth.instrument.module.LowpassFilter.prototype.connect = function (anAudioNode) {
  this.filter_.connect(anAudioNode);
};

// #endif
