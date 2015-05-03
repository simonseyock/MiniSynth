// #ifndef __CONTROLLERPASSFILTER_
// #define __CONTROLLERPASSFILTER__

// #include "../modules/PassFilter.js"
// #include "Controller.js"
// #include "../html/RotaryControl.js"

// Amount

synth.controller.PassFilter = function (audioContext, opt_options) {

  opt_options = opt_options || {};

	this.module = new synth.module.PassFilter(audioContext, opt_options.passFilterOptions);

	this.className_ = opt_options.className || "synth-module-passfilter";

	synth.controller.Controller.call(this, opt_options);

  // type

  var typeControl = new synth.html.DiscreteRotaryControl({ title: "Type", values: ["lowpass", "highpass", "bandpass"], initial: this.module.getType() });
  typeControl.on("change:value", function() {
    this.module.setType(typeControl.getValue());
  }.bind(this));
  this.module.on("change:type", function (value) {
    typeControl.setValue(value);
  };

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Freq", min: 50, max: 1000, logarithmic: true, displayPrecision: 0, initial: this.module.getFrequency() });
  freqControl.on("change:value", function () {
    this.module.setFrequency(freqControl.getValue());
  }.bind(this));
  this.module.on("change:frequency", function (value) {
    freqControl.setValue(value);
  };

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0.01, max: 100, logarithmic: true, displayPrecision: 0, initial: this.module.getResonance() });
  resoControl.on("change:value", function () {
    this.module.setResonance(resoControl.getValue());
  }.bind(this));
  this.module.on("change:resonance", function (value) {
    resoControl.setValue(value);
  };

  // Amount

  var amountControl = new synth.html.AnalogRotaryControl({ title: "Amount", min: 0, max: 1, initial: this.module.getAmount() });
  amountControl.on("change:value", function () {
    this.module.setAmount(amountControl.getValue());
  }.bind(this));
  this.module.on("change:amount", function (value) {
    amountControl.setValue(value);
  };

  this.$element_.append(typeControl.get$Element());
  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
  this.$element_.append(amountControl.get$Element());
};
synth.inherits(synth.controller.PassFilter, synth.controller.Controller);


// #endif
