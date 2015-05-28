// #ifndef __CONTROLLERGAIN_
// #define __CONTROLLERGAIN__

// #include "Controller.js"
// #include "../html/RotaryControl.js"
// #include "../modules/Gain.js"

synth.controller.Gain = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  this.module = new synth.module.Gain(audioContext, opt_options.gainOptions);

	this.className_ = opt_options.className || "synth-module-gain";

	synth.controller.Controller.call(this, opt_options);

  // frequency

  var gainControl = new synth.html.AnalogRotaryControl({
    title: "Vol",
    //logarithmic: true,
    min: 0, max: 1,
    //interpretValueBelowAsZero: 0.00105,
    displayPrecision: 3,
    initial: 0.4
  });

  gainControl.bindProperty("value", this.module, "gain");

  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.controller.Gain, synth.controller.Controller);


// #endif
