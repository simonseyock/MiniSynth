// #ifndef __VIEWCONTROLLERSOUNDGENERATOR_
// #define __VIEWCONTROLLERSOUNDGENERATOR__

// #include "ViewController.js"
// #include "html/RotaryControl.js"

synth.viewController.SoundGenerator = function (soundGenerator, opt_options) {

	this.soundGenerator_ = soundGenerator;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.viewController.ViewController.call(this, opt_options);



  this.$element_.append($clearButton);
};
synth.inherits(synth.viewController.SoundGenerator, synth.viewController.ViewController);


// #endif
