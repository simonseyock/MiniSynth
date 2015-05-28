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

  var typeControl = new synth.html.DiscreteRotaryControl({ title: "Type", values: ["lowpass", "highpass", "bandpass"], initial: this.module.get("type") });
  typeControl.bindProperty("value", this.module, "type");

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Cutoff", min: 50, max: 1000, displayPrecision: 2, initial: this.module.get("frequency") });
  freqControl.bindProperty("value", this.module, "frequency");

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0, max: 50, /* logarithmic: true, */ displayPrecision: 2, initial: this.module.get("resonance") });
  resoControl.bindProperty("value", this.module, "resonance");

  // Amount

  var amountControl = new synth.html.AnalogRotaryControl({ title: "Amount", min: 0, max: 1, displayPrecision: 2, initial: this.module.get("amount") });
  amountControl.bindProperty("value", this.module, "amount");

  this.$element_.append(typeControl.get$Element());
  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
  this.$element_.append(amountControl.get$Element());
};
synth.inherits(synth.controller.PassFilter, synth.controller.Controller);


// #endif
