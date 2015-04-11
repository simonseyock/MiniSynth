// #ifndef __VIEWCONTROLLERPASSFILTER_
// #define __VIEWCONTROLLERPASSFILTER__

// #include "../modules/PassFilter.js"
// #include "ViewController.js"
// #include "../html/RotaryControl.js"

// Amount

synth.viewController.PassFilter = function (passFilter, opt_options) {

	this.passFilter_ = passFilter;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-passfilter";

	synth.viewController.ViewController.call(this, opt_options);

  // type

  var typeControl = new synth.html.DiscreteRotaryControl({ title: "Type", values: ["lowpass", "highpass", "bandpass"], initial: passFilter.getType() });
  typeControl.on("change:value", function() {
    this.passFilter_.setType(typeControl.getValue());
  }.bind(this));

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Freq", min: 100, max: 1000, logarithmic: true, displayPrecision: 0, initial: passFilter.getFrequency() });
  freqControl.on("change:value", function () {
    this.passFilter_.setFrequency(freqControl.getValue());
  }.bind(this));

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0.01, max: 10, logarithmic: true, displayPrecision: 0, initial: passFilter.getResonance() });
  resoControl.on("change:value", function () {
    this.passFilter_.setResonance(resoControl.getValue());
  }.bind(this));

  // Amount

  var amountControl = new synth.html.AnalogRotaryControl({ title: "Amount", min: 0, max: 1, initial: this.passFilter_.getAmount() });
  amountControl.on("change:value", function () {
    this.passFilter_.setAmount(amountControl.getValue());
  }.bind(this));

  this.$element_.append(typeControl.get$Element());
  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
  this.$element_.append(amountControl.get$Element());
};
synth.inherits(synth.viewController.PassFilter, synth.viewController.ViewController);


// #endif
