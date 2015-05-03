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
  opt_options.soundGeneratorOptions.envelope = { attack: 0.1, decay: 0, sustain: 1, release: 0.1 };

  this.module = new synth.module.SoundGenerator(audioContext, opt_options.soundGeneratorOptions);

	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.controller.Controller.call(this, opt_options);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: this.module.getWaveType() });
  waveTypeControl.on("change:value", function () {
    this.module.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0.01, max: 1, logarithmic: true, displayPrecision: 2, initial: this.module.getGain() });
  gainControl.on("change:value", function () {
    this.module.setGain(gainControl.getValue());
  }.bind(this));

  // attack

  var attackControl = new synth.html.AnalogRotaryControl({ title: "Attack", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: this.module.getAttack() });
  attackControl.on("change:value", function () {
    this.module.setAttack(attackControl.getValue());
  }.bind(this));

  // decay

  var decayControl = new synth.html.AnalogRotaryControl({ title: "Decay", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: this.module.getDecay() });
  decayControl.on("change:value", function () {
    this.module.setDecay(decayControl.getValue());
  }.bind(this));

  // sustain

  var sustainControl = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 2, initial: this.module.getSustain() });
  sustainControl.on("change:value", function () {
    this.module.setSustain(sustainControl.getValue());
  }.bind(this));

  // release

  var releaseControl = new synth.html.AnalogRotaryControl({ title: "Release", min: 0.01, max: 20, logarithmic: true, displayPrecision: 3, unit: "s", initial: this.module.getRelease() });
  releaseControl.on("change:value", function () {
    this.module.setRelease(releaseControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
  this.$element_.append(attackControl.get$Element());
  this.$element_.append(decayControl.get$Element());
  this.$element_.append(sustainControl.get$Element());
  this.$element_.append(releaseControl.get$Element());

};
synth.inherits(synth.controller.SoundGenerator, synth.controller.Controller);


// #endif
