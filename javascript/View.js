// #ifndef __VIEW__
// #define __VIEW__

// #include "init.js"

synth.View = function (opt_options) {

	opt_options = opt_options || {};
	
	this.className_ = ("className" in opt_options)? opt_options.className :"synth-view";
	
	this.$element_ = $("<div>").addClass(this.className_);
	
	if ("$target" in opt_options) {
		opt_options.$target.append(this.$element_);
	}
};

synth.View.prototype.get$Element = function () {
	return this.$element_;
};

// #endif