// #ifndef __VIEWCONTROLLER__
// #define __VIEWCONTROLLER__

synth.viewController = synth.viewController || {};

synth.viewController.ViewController = function (opt_options) {

	opt_options = opt_options || {};
	
	this.$element_ = $("<div>").addClass(this.className_);
	
	if ("$target" in opt_options) {
		opt_options.$target.append(this.$element_);
	}
};

synth.viewController.ViewController.prototype.get$Element = function () {
	return this.$element_;
};

synth.viewController.ViewController.prototype.set$Target = function ($target) {
	$target.append(this.$element_);
};

// #endif