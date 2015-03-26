// #ifndef __INPUTFIELD__
// #define __INPUTFIELD__

// #include "../Observable.js"

synth.html = synth.html || {};

synth.html.InputField = function () {
	synth.Observable.call(this);
	
	this.registerEventType("input");
	
	this.$element_ = $("<input>");
	
	var valueBeforeEdit = null;
	
	var onFocus = function (e) {
		valueBeforeEdit = this.$element_.val();
	}.bind(this);
	
	var onBlur = function (e) {
		this.fireEvent("input", [this.$element_.val()]);
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
synth.inherits(synth.html.InputField, synth.Observable);

synth.html.InputField.prototype.get$Element = function () {
	return this.$element_;
};

synth.html.InputField.prototype.setValue = function (value) {
	this.$element_.val(value);
};

synth.html.InputField.prototype.getValue = function () {
	return this.$element_.val();
};

// #endif