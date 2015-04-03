// #ifndef __VIEWCONTROLLERLOWPASSFILTER_
// #define __VIEWCONTROLLERLOWPASSFILTER__

// #include "ViewController.js"
// #include "html/RotaryControl.js"

synth.viewController.LowpassFilter = function (lowpassFilter, opt_options) {

	this.lowpassFilter_ = lowpassFilter;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-lowpassfilter";

	synth.viewController.ViewController.call(this, opt_options);

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Freq", min: 100, max: 1000, initial: lowpassFilter.getFrequency() });
  freqControl.on("change:value", function () {
    this.lowpassFilter_.setFrequency(freqControl.getValue());
  }.bind(this));

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0.01, max: 10, initial: lowpassFilter.getResonance() });
  resoControl.on("change:value", function () {
    this.lowpassFilter_.setResonance(resoControl.getValue());
  }.bind(this));


  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
};
synth.inherits(synth.viewController.LowpassFilter, synth.viewController.ViewController);


// #endif
