// #ifndef __CONTROLLERSYNTHESIZER__
// #define __CONTROLLERSYNTHESIZER__

// #include "Controller.js"
// #include "../instruments/ModularSynth.js"
// #include "SoundGenerator.js"
// #include "PassFilter.js"
// #include "Gain.js"
// #include "Storage.js"

synth.controller.Synthesizer = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  opt_options.synthesizerOptions = opt_options.synthesizerOptions || {};
  opt_options.synthesizerOptions.frequencyTable = opt_options.synthesizerOptions.frequencyTable || synth.scales.frequencyTables.a4is440Hz;

  this.instrument = new synth.instrument.ModularSynth(audioContext, opt_options.synthesizerOptions);

	this.className_ = opt_options.className || "synth-synthesizer";

	synth.controller.Controller.call(this, opt_options);

  // storage

  this.storageController_ = new synth.controller.Storage({ storageKey: "instrument", stateExchangable: this.instrument, selectFirst: true });

  this.$element_.append(this.storageController_.get$Element());

  // sound generator 1

  this.soundGenerator1Controller_ = new synth.controller.SoundGenerator(audioContext);

  this.instrument.addModule(this.soundGenerator1Controller_.module);

  this.$element_.append(this.soundGenerator1Controller_.get$Element().prepend("<p>Oscillator 1</p>"));

  // filter 1

  this.filter1Controller_ = new synth.controller.PassFilter(audioContext);

  this.soundGenerator1Controller_.module.connect(this.filter1Controller_.module);

  this.instrument.addModule(this.filter1Controller_.module);

  this.$element_.append(this.filter1Controller_.get$Element().prepend("<p>Filter 1</p>"));

  // sound generator 2

  this.soundGenerator2Controller_ = new synth.controller.SoundGenerator(audioContext);

  this.instrument.addModule(this.soundGenerator2Controller_.module);

  this.$element_.append(this.soundGenerator2Controller_.get$Element().prepend("<p>Oscillator 2</p>"));

  // filter2

  this.filter2Controller_ = new synth.controller.PassFilter(audioContext);

  this.soundGenerator2Controller_.module.connect(this.filter2Controller_.module);

  this.instrument.addModule(this.filter2Controller_.module);

  this.$element_.append(this.filter2Controller_.get$Element().prepend("<p>Filter 2</p>"));

  // merge

  this.gainController_ = new synth.controller.Gain(audioContext);

  this.instrument.setOutputModule(this.gainController_.module);

  this.$element_.append(this.gainController_.get$Element());

  this.filter1Controller_.module.connect(this.gainController_.module);

  this.filter2Controller_.module.connect(this.gainController_.module);

};
synth.inherits(synth.controller.Synthesizer, synth.controller.Controller);

// #endif
