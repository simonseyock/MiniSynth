// #ifndef __VIEWCONTROLLERSYNTHESIZER__
// #define __VIEWCONTROLLERSYNTHESIZER__

// #include "ViewController.js"
// #include "../instruments/ModularSynth.js"
// #include "SoundGenerator.js"
// #include "PassFilter.js"
// #include "Gain.js"

synth.viewController.Synthesizer = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  opt_options.synthesizerOptions = opt_options.synthesizerOptions || {};
  opt_options.synthesizerOptions.frequencyTable = opt_options.synthesizerOptions.frequencyTable || synth.scales.frequencyTables.a4is440Hz;

  this.instrument = new synth.instrument.ModularSynth(audioContext, opt_options.synthesizerOptions);

	this.className_ = opt_options.className || "synth-synthesizer";

	synth.viewController.ViewController.call(this, opt_options);


  // sound generator 1

  this.soundGenerator1 = new synth.viewController.SoundGenerator(audioContext);

  this.instrument.addModule(this.soundGenerator1.module);

  this.$element_.append(this.soundGenerator1.get$Element());

  this.$element_.append("<br />");

  // filter 1

  this.filter1 = new synth.viewController.PassFilter(audioContext);

  this.soundGenerator1.module.connect(this.filter1.module);

  this.instrument.addModule(this.filter1.module);

  this.$element_.append(this.filter1.get$Element());

  this.$element_.append("<br />");

  // sound generator 2

  this.soundGenerator2 = new synth.viewController.SoundGenerator(audioContext);

  this.instrument.addModule(this.soundGenerator2.module);

  this.$element_.append(this.soundGenerator2.get$Element());

  this.$element_.append("<br />");

  // filter2

  this.filter2 = new synth.viewController.PassFilter(audioContext);

  this.soundGenerator2.module.connect(this.filter2.module);

  this.instrument.addModule(this.filter2.module);

  this.$element_.append(this.filter2.get$Element());

  this.$element_.append("<br />");

  // merge

  this.gain = new synth.viewController.Gain(audioContext);

  this.instrument.addModule(this.gain.module);

  this.$element_.append(this.gain.get$Element());

  this.filter1.module.connect(this.gain.module);

  this.filter2.module.connect(this.gain.module);

  // connect to destination

  this.gain.module.connect(audioContext.destination);
};
synth.inherits(synth.viewController.Synthesizer, synth.viewController.ViewController);

// #endif
