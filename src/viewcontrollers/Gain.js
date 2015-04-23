// #ifndef __VIEWCONTROLLERGAIN_
// #define __VIEWCONTROLLERGAIN__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"

synth.viewController.Gain = function (gainModule, opt_options) {

	this.gainModule_ = gainModule;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-gain";

	synth.viewController.ViewController.call(this, opt_options);

  // frequency

  var gainControl = new synth.html.AnalogRotaryControl({
    title: "Vol",
    logarithmic: true,
    min: 0.001, max: 1,
    interpretValueBelowAsZero: 0.00105,
    displayPrecision: 3,
    initial: gainModule.getGain()
  });
  gainControl.on("change:value", function () {
    this.gainModule_.setGain(gainControl.getValue());
  }.bind(this));


  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.Gain, synth.viewController.ViewController);


// #endif
