// #ifndef __CONTROLLERSOUNDGENERATOR_
// #define __CONTROLLERSOUNDGENERATOR__

// #include "Controller.js"
// #include "../html/RotaryControl.js"
// #include "../modules/SoundGenerator.js"

synth.controller.SoundGenerator = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  opt_options.soundGeneratorOptions = opt_options.soundGeneratorOptions || {};
  opt_options.soundGeneratorOptions.waveType = "sine";
  opt_options.soundGeneratorOptions.gain = 0.6;
  opt_options.soundGeneratorOptions.envelope = { attack: 0.1, decay: 0, sustain: 1, release: 0.2 };

  this.module = new synth.module.SoundGenerator(audioContext, opt_options.soundGeneratorOptions);

	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.controller.Controller.call(this, opt_options);

  // wave form -> dropdown?

  this.waveTypeControl_ = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: this.module.get("waveType") });
  this.waveTypeControl_.bindProperty("value", this.module, "waveType");

  // gain

  this.gainControl_ = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, initial: this.module.get("gain") });
  this.gainControl_.bindProperty("value", this.module, "gain");

  // attack

  this.attackControl_ = new synth.html.AnalogRotaryControl({ title: "Attack", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("attack") });
  this.attackControl_.bindProperty("value", this.module, "attack");

  // decay

  this.decayControl_ = new synth.html.AnalogRotaryControl({ title: "Decay", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("decay") });
  this.decayControl_.bindProperty("value", this.module, "decay");

  // sustain

  this.sustainControl_ = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 2, initial: this.module.get("sustain") });
  this.sustainControl_.bindProperty("value", this.module, "sustain");

  // release

  this.releaseControl_ = new synth.html.AnalogRotaryControl({ title: "Release", min: 0, max: 5, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("release") });
  this.releaseControl_.bindProperty("value", this.module, "release");

  this.$element_.append(this.waveTypeControl_.get$Element());
  this.$element_.append(this.gainControl_.get$Element());
  this.$element_.append(this.attackControl_.get$Element());
  this.$element_.append(this.decayControl_.get$Element());
  this.$element_.append(this.sustainControl_.get$Element());
  this.$element_.append(this.releaseControl_.get$Element());

};
synth.inherits(synth.controller.SoundGenerator, synth.controller.Controller);


// #endif
