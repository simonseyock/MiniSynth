// #ifndef __CONTROLLER__
// #define __CONTROLLER__

synth.controller = synth.controller || {};

synth.controller.Controller = function (opt_options) {

	opt_options = opt_options || {};

	this.$element_ = $("<div>").addClass(this.className_);

	if ("$target" in opt_options) {
		opt_options.$target.append(this.$element_);
	}
};

synth.controller.Controller.prototype.get$Element = function () {
	return this.$element_;
};

synth.controller.Controller.prototype.set$Target = function ($target) {
	$target.append(this.$element_);
};

// #endif
