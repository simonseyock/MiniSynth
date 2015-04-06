// #ifndef __VIEWCONTROLLERSOUNDGENERATOR_
// #define __VIEWCONTROLLERSOUNDGENERATOR__

// #include "ViewController.js"
// #include "html/RotaryControl.js"

synth.viewController.SoundGenerator = function (soundGenerator, opt_options) {

	this.soundGenerator_ = soundGenerator;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-soundgenerator-simple";

	synth.viewController.ViewController.call(this, opt_options);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: soundGenerator.getWaveType() });
  waveTypeControl.on("change:value", function () {
    this.soundGenerator_.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0, max: 2, initial: soundGenerator.getGain() });
  gainControl.on("change:value", function () {
    this.soundGenerator_.setGain(gainControl.getValue());
  }.bind(this));

  // attack

  var attackControl = new synth.html.AnalogRotaryControl({ title: "Attack", min: 1, max: 10000, logarithmic: true, displayPrecision: 0, unit: "ms", initial: soundGenerator.getAttack() });
  attackControl.on("change:value", function () {
    this.soundGenerator_.setAttack(attackControl.getValue());
  }.bind(this));

  // decay

  var decayControl = new synth.html.AnalogRotaryControl({ title: "Decay", min: 1, max: 10000, logarithmic: true, displayPrecision: 0, unit: "ms", initial: soundGenerator.getDecay() });
  decayControl.on("change:value", function () {
    this.soundGenerator_.setAttack(decayControl.getValue());
  }.bind(this));

  // sustain

  var sustainControl = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 0, initial: soundGenerator.getSustain() });
  sustainControl.on("change:value", function () {
    this.soundGenerator_.setAttack(sustainControl.getValue());
  }.bind(this));

  // release

  var releaseControl = new synth.html.AnalogRotaryControl({ title: "Release", min: 10, max: 20000, logarithmic: true, displayPrecision: 0, unit: "ms", initial: soundGenerator.getRelease() });
  releaseControl.on("change:value", function () {
    this.soundGenerator_.setAttack(releaseControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
  this.$element_.append(attackControl.get$Element());
  this.$element_.append(decayControl.get$Element());
  this.$element_.append(sustainControl.get$Element());
  this.$element_.append(releaseControl.get$Element());

};
synth.inherits(synth.viewController.SoundGeneratorSimple, synth.viewController.ViewController));


// #endif
