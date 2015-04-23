// #ifndef __VIEWCONTROLLERFIXEDTYPEPASSFILTER_
// #define __VIEWCONTROLLERFIXEDTYPEPASSFILTER__

// #include "ViewController.js"
// #include "../html/RotaryControl.js"
// #include "../modules/PassFilter.js"

// Amount

synth.viewController.FixedTypePassFilter = function (audioContext, opt_options) {

  opt_options = opt_options || {};

  this.module = new synth.module.PassFilter(audioContext, opt_options.passFilterOptions);

	this.className_ = opt_options.className || "synth-module-fixedtypepassfilter";

	synth.viewController.ViewController.call(this, opt_options);

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Freq", min: 100, max: 1000, logarithmic: true, displayPrecision: 0, initial: this.module.getFrequency() });
  freqControl.on("change:value", function () {
    this.module.setFrequency(freqControl.getValue());
  }.bind(this));

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0.01, max: 10, logarithmic: true, displayPrecision: 0, initial: this.module.getResonance() });
  resoControl.on("change:value", function () {
    this.module.setResonance(resoControl.getValue());
  }.bind(this));


  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
};
synth.inherits(synth.viewController.FixedTypePassFilter, synth.viewController.ViewController);


// #endif
