// #ifndef __MODULARSYNTH__
// #define __MODULARSYNTH__

// #include "Instrument.js"

synth.instrument.ModularSynth = function (audioContext, scale) {

  //opt_options = opt_options || {};

	//synth.StateExchange.call(this);

  synth.instrument.Instrument.call(this, audioContext, scale);

  this.modules_ = [];

};
synth.inherits(synth.instrument.ModularSynth, synth.instrument.Instrument);

synth.instrument.ModularSynth.prototype.addModule = function (aModule) {
  this.modules_.push(aModule);
  if(aModule.watch) {
    aModule.watch(this.frequenciesToPlay);
  }
};

synth.instrument.ModularSynth.prototype.pause = function (when) {
  this.modules_.forEach(function (aModule) {
    if(aModule.pause) {
      aModule.pause(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);

  this.modules_.forEach(function (aModule) {
    if(aModule.update) {
      aModule.update(when);
    }
  }.bind(this));
};
// #endif
