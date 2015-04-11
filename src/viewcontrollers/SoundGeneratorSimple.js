// #ifndef __VIEWCONTROLLERSOUNDGENERATORSIMPLE_
// #define __VIEWCONTROLLERSOUNDGENERATORSIMPLE__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"

synth.viewController.SoundGeneratorSimple = function (soundGenerator, opt_options) {

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

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.SoundGeneratorSimple, synth.viewController.ViewController);


// #endif
