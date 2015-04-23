// #ifndef __VIEWCONTROLLERSOUNDGENERATORSIMPLE_
// #define __VIEWCONTROLLERSOUNDGENERATORSIMPLE__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"
// #include "../modules/SoundGenerator.js"

synth.viewController.SoundGeneratorSimple = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  opt_options.soundGeneratorOptions = opt_options.soundGeneratorOptions || {};
  opt_options.soundGeneratorOptions.waveType = "sine";
  opt_options.soundGeneratorOptions.gain = 0.6;
  opt_options.soundGeneratorOptions.envelope = { attack: 0.1, decay: 0, sustain: 1, release: 0.1 };

  this.module = new synth.module.SoundGenerator(audioContext, opt_options.soundGeneratorOptions);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: this.module.getWaveType() });
  waveTypeControl.on("change:value", function () {
     this.module.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0, max: 2, initial: this.module.getGain() });
  gainControl.on("change:value", function () {
     this.module.setGain(gainControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.SoundGeneratorSimple, synth.viewController.ViewController);


// #endif
