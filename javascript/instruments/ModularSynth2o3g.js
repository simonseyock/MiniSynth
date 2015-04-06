// #ifndef __MODULARSYNTH2O3G__
// #define __MODULARSYNTH2O3G__

// #include "Instrument.js"
// #include "modules/SoundGenerator.js"
// #include "modules/Timer.js"
// #include "modules/GainModule.js"


/////////// IDEA - not in use! //////////////

synth.instrument.ModularSynth2o3g = function (audioContext, scale) {

  //opt_options = opt_options || {};

	//synth.StateExchange.call(this);

  synth.instrument.Instrument.call(this, audioContext, scale);

  this.soundGenerator1_ = new synth.instrument.module.SoundGenerator(audioContext, "square", synth.instrument.module.Timer, 8);
  this.soundGenerator1_.watch(this.frequenciesToPlay);
  this.gain1_ = audioContext.createGain();
  this.soundGenerator1_.connect(this.gain1_);

  this.soundGenerator2_ = new synth.instrument.module.SoundGenerator(audioContext, "square", synth.instrument.module.Timer, 8);
  this.soundGenerator2_.watch(this.frequenciesToPlay);
  this.gain2_ = audioContext.createGain();
  this.soundGenerator2_.connect(this.gain2_);

  this.gain3_ = audioContext.createGain();
  this.gain1_.connect(this.gain3_);
  this.gain2_.connect(this.gain3_);
};
synth.inherits(synth.instrument.ModularSynth2o3g, synth.instrument.Instrument);

synth.instrument.ModularSynth2o3g.prototype.setWaveType1 = function (waveType) {
  this.soundGenerator1_.setWaveType(waveType);
};

synth.instrument.ModularSynth2o3g.prototype.setWaveType2 = function (waveType) {
  this.soundGenerator2_.setWaveType(waveType);
};

synth.instrument.ModularSynth2o3g.prototype.setGain1 = function (gain) {
  this.gain1_.gain.value = gain;
};

synth.instrument.ModularSynth2o3g.prototype.setGain2 = function (gain) {
  this.gain2_.gain.value = gain;
};

synth.instrument.ModularSynth2o3g.prototype.setGain3 = function (gain) {
  this.gain3_.gain.value = gain;
};

synth.instrument.ModularSynth2o3g.prototype.connect = function (anAudioNode) {
  this.gain3_.connect(anAudioNode);
};

synth.instrument.ModularSynth2o3g.prototype.pause = function (when) {
  this.soundGenerator1_.pause();
  this.soundGenerator2_.pause();
};

synth.instrument.ModularSynth2o3g.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);

  this.soundGenerator1_.updateTimes(when);
  this.soundGenerator2_.updateTimes(when);
};
// #endif
