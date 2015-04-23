// #ifndef __VIEWCONTROLLERGAIN_
// #define __VIEWCONTROLLERGAIN__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"
// #include "../modules/Gain.js"

synth.viewController.Gain = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  this.module = new synth.module.Gain(audioContext, opt_options.gainOptions);

	this.className_ = opt_options.className || "synth-module-gain";

	synth.viewController.ViewController.call(this, opt_options);

  // frequency

  var gainControl = new synth.html.AnalogRotaryControl({
    title: "Vol",
    logarithmic: true,
    min: 0.001, max: 1,
    interpretValueBelowAsZero: 0.00105,
    displayPrecision: 3,
    initial: this.module.getGain()
  });
  gainControl.on("change:value", function () {
    this.module.setGain(gainControl.getValue());
  }.bind(this));


  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.Gain, synth.viewController.ViewController);


// #endif
