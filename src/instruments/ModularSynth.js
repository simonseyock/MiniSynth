// #ifndef __MODULARSYNTH__
// #define __MODULARSYNTH__

// #include "Instrument.js"
// #include "../Scales.js"

/*
 * The ModularSynth is an Instrument which consists of different not predefined modules. They can be added with the addModule method.
 * If a module has a watch method, the module gets informed about new notes to be played.
 * The modules need to be connected manually outside the modular synth.
 * Important: The module the output comes from needs to be set with the setOutputModule method.
 */

synth.instrument.ModularSynth = function (audioContext, opt_options) {

  opt_options = opt_options || {};

	//synth.StateExchange.call(this);

  synth.instrument.Instrument.call(this, audioContext, opt_options);

  this.modules_ = [];

};
synth.inherits(synth.instrument.ModularSynth, synth.instrument.Instrument);

synth.instrument.ModularSynth.prototype.addModule = function (aModule) {
  this.modules_.push(aModule);
  if(aModule.listen) {
    aModule.listen(this.frequenciesToPlay);
  }
};

synth.instrument.ModularSynth.prototype.setOutputModule = function (aModule) {
  this.addModule(aModule);
  this.output = aModule;
};

synth.instrument.ModularSynth.prototype.pause = function (when) {
  this.modules_.forEach(function (aModule) {
    if(aModule.pause) {
      aModule.pause(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.interrupt = function () {
  this.modules_.forEach(function (aModule) {
    if(aModule.interrupt) {
      aModule.interrupt();
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);

  this.modules_.forEach(function (aModule) {
    if(aModule.updateTiming) {
      aModule.updateTiming(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.getState = function () {
  var state = synth.instrument.Instrument.prototype.getState.call(this);
  state.modules = [];
  this.modules_.forEach(function (aModule) {
    state.modules.push(aModule.getState());
  });
  return state;
};

synth.instrument.ModularSynth.prototype.setState = function (state) {
  synth.instrument.Instrument.prototype.setState.call(this, state);
  state.modules.forEach(function (aModuleState, index) {
    if (this.modules_[index]) {
      this.modules_[index].setState(aModuleState);
    }
  }.bind(this));
};

// #endif
