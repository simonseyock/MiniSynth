// #ifndef __VIEWCONTROLLERSOUNDGENERATOR_
// #define __VIEWCONTROLLERSOUNDGENERATOR__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"

synth.viewController.SoundGenerator = function (soundGenerator, opt_options) {

	this.soundGenerator_ = soundGenerator;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.viewController.ViewController.call(this, opt_options);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: soundGenerator.getWaveType() });
  waveTypeControl.on("change:value", function () {
    this.soundGenerator_.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0.01, max: 1, logarithmic: true, displayPrecision: 2, initial: soundGenerator.getGain() });
  gainControl.on("change:value", function () {
    this.soundGenerator_.setGain(gainControl.getValue());
  }.bind(this));

  // attack

  var attackControl = new synth.html.AnalogRotaryControl({ title: "Attack", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: soundGenerator.getAttack() });
  attackControl.on("change:value", function () {
    this.soundGenerator_.setAttack(attackControl.getValue());
  }.bind(this));

  // decay

  var decayControl = new synth.html.AnalogRotaryControl({ title: "Decay", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: soundGenerator.getDecay() });
  decayControl.on("change:value", function () {
    this.soundGenerator_.setDecay(decayControl.getValue());
  }.bind(this));

  // sustain

  var sustainControl = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 2, initial: soundGenerator.getSustain() });
  sustainControl.on("change:value", function () {
    this.soundGenerator_.setSustain(sustainControl.getValue());
  }.bind(this));

  // release

  var releaseControl = new synth.html.AnalogRotaryControl({ title: "Release", min: 0.01, max: 20, logarithmic: true, displayPrecision: 3, unit: "s", initial: soundGenerator.getRelease() });
  releaseControl.on("change:value", function () {
    this.soundGenerator_.setRelease(releaseControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
  this.$element_.append(attackControl.get$Element());
  this.$element_.append(decayControl.get$Element());
  this.$element_.append(sustainControl.get$Element());
  this.$element_.append(releaseControl.get$Element());

};
synth.inherits(synth.viewController.SoundGenerator, synth.viewController.ViewController);


// #endif
