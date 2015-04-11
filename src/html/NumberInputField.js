// #ifndef __NUMBERINPUTFIELD__
// #define __NUMBERINPUTFIELD__

// #include "../Observable.js"

synth.html = synth.html || {};

synth.html.NumberInputField = function (opt_options) {
  opt_options = opt_options || {};

	synth.Observable.call(this);

  this.displayPrecision_ = opt_options.displayPrecision || 2;

	this.registerEventType("input");

	this.$element_ = $("<input>");
  this.setValue(opt_options.initial || 0);

	var valueBeforeEdit = null;

	var onFocus = function (e) {
		valueBeforeEdit = this.$element_.val();
	}.bind(this);

	var onBlur = function (e) {
    this.setValue(parseFloat(this.$element_.val()));
	}.bind(this);

	var onKeydown = function (e) {
		if(e.which === 13) { // enter
			this.$element_.blur();
		} else if (e.which === 27) { // escape
			this.$element_.val(valueBeforeEdit);
			this.$element_.blur();
		}
	}.bind(this);

	this.$element_.on("focus", onFocus);
	this.$element_.on("blur", onBlur);
	this.$element_.on("keydown", onKeydown);
};
synth.inherits(synth.html.NumberInputField, synth.Observable);

synth.html.NumberInputField.prototype.get$Element = function () {
	return this.$element_;
};

synth.html.NumberInputField.prototype.setValue = function (value) {
  var oldValue = this.value_;
  this.value_ = value;
	this.$element_.val(value.toFixed(this.displayPrecision_));
  this.fireEvent("input", [{oldValue: oldValue, newValue: value}]);
};

synth.html.NumberInputField.prototype.getValue = function () {
	return this.value_;
};

// #endif
