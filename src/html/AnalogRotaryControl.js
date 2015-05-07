// #ifndef __ANALOGROTARYCONTROL__
// #define __ANALOGROTARYCONTROL__

// #include "RotaryControl.js"

//AnalogRotaryControl.prototype.setTransformFunctions = function (from, to) {
//	this.valueFromExternal_ = from
//	this.valueToExternal_ = to;
//};

/**
 * AnalogRotaryControl
 * @class
 *
 *
 */

// TODO: Use setters, getters from ChangeFiring

synth.html.AnalogRotaryControl = function(opt_options) {
  opt_options = opt_options || {};

  this.min_ = opt_options.min || 0;
  this.max_ = opt_options.max || 1;

  if (opt_options.hasOwnProperty("logarithmic") && opt_options.logarithmic) {
    if(this.min_ < 0) {
      throw new Error("With logarithmic behaviour the min value can't be smaller than 0.");
    }

    this.interpretValueBelowAsZero_ = opt_options.interpretValueBelowAsZero || false;

    this.mappingFunction_ = function (x) {
      return this.min_/Math.E * Math.exp(Math.log(this.max_*Math.E/this.min_)*x);
    };
    this.inverseMappingFunction_ = function (y) {
      //if (y === 0) {
      //  y = this.min_;
      //}
      return Math.log(y*Math.E/this.min_) / Math.log(this.max_*Math.E/this.min_);
    };
  } else {
    this.mappingFunction_ = function (x) {
      return this.min_ + x * (this.max_ - this.min_)
    };
    this.inverseMappingFunction_ = function (y) {
      return y / (this.max_ - this.min_) - this.min_;
    };
  }

  opt_options.initial = Math.min(this.max_, Math.max(this.min_, opt_options.initial || this.min_));

	synth.html.RotaryControl.call(this, opt_options);

  this.dots_ = [0,1];
  this.createDots_();

  this.displayPrecision_ = opt_options.displayPrecision || 3;
  this.unit_ = opt_options.unit || "";
  this.setEditable(opt_options.editable || true);

  //this.set("value",);
  this.updatePositionFromValue();
  this.updateValueField();

  this.on("change:value", this.updateValueField);
};
synth.inherits(synth.html.AnalogRotaryControl, synth.html.RotaryControl);

synth.html.AnalogRotaryControl.prototype.updateValueField = function () {
//  if (this.interpretValueBelowAsZero_ !== false && value < this.interpretValueBelowAsZero_) {
//    value = 0;
//  } else {
//    value = Math.min(this.max_, Math.max(this.min_, value));
//  }

  var displayValue = this.get("value").toFixed(this.displayPrecision_);
  if (this.unit_) {
    displayValue += " " + this.unit_;
  }

  this.$valueField_.val(displayValue);
};

synth.html.AnalogRotaryControl.prototype.setEditable = function (editable) {
  this.editable_ = editable;

  //var onFocus = function(e) {
		//this.$valueField_.removeClass("synth-input-camouflage");
	//}.bind(this);

	if (this.editable_) {
		this.$valueField_.attr("disabled", false);
		//this.$valueField_.on("focus", onFocus);
		this.$valueField_.on("blur", function(e) {
			//this.$valueField_.addClass("synth-input-camouflage");
      var input = parseFloat(this.$valueField_.val());
      if (!_.isNaN(input)) {
        this.set("value", input);
      }
	 	}.bind(this));
		this.$valueField_.on("keydown", function(e) {
			if(e.which === 13) { // enter
				this.$valueField_.blur();
			} else if (e.which === 27) { // escape
				this.updateValueFromPosition();
				this.$valueField_.blur();
			}
		}.bind(this));
	} else {
		this.$valueField_.attr("disabled", true);
		//this.$valueField_.off("focus", onFocus);
	}
};

synth.html.AnalogRotaryControl.prototype.updateValueFromPosition = function () {
  this.set("value", this.mappingFunction_(this.get("position")));
};

synth.html.AnalogRotaryControl.prototype.updatePositionFromValue = function () {
  this.set("position", this.shorten(this.inverseMappingFunction_(this.get("value"))));
};

// #endif
