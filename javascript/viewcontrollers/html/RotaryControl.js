// #ifndef __ROTARYCONTROL__
// #define __ROTARYCONTROL__

// #include "../../Observable.js"

synth.html = synth.html || {};

synth.html.RotaryControl = function(opt_options) {

  opt_options = opt_options || {};

  synth.Observable.call(this);

  this.registerEventType("change:value");

	this.spareDegrees = 90;

	this.resolution = 0.005;

	this.className_ = "rotary-control";
  this.classNameTitle_ = this.className_ + "-title";
	this.classNameSVG_ = this.className_ + "-svg";
	this.classNamePointer_ = this.className_ + "-pointer";
	this.classNameValueField_ = this.className_ + "-valuefield";

	this.$element_ = $("<div>").addClass(this.className_);

  if (opt_options.title) {
    this.$element_.append($("<div>").addClass(this.classNameTitle_).append(opt_options.title));
  }

	this.strokeWidth_ = 8;
	this.radius_ = 26;
	this.pointerLength_ = 25;
	this.pointerDistanceFromCenter_ = 12;
	this.dotRadius = 4;
	this.dotMinDistanceFromBorder_ = 2;

	this.$svg_ = $('<svg viewBox = "0 0 100 100" version = "1.1"></svg>').attr("class", this.classNameSVG_);

	this.$element_.append(this.$svg_);

	this.$svg_.html('<circle cx="50" cy="50" r="' + this.radius_ + '" stroke-width="' + this.strokeWidth_ + '" fill="transparent" />'
		+'<rect class="' + this.classNamePointer_ + '" width="' + this.strokeWidth_ + '" height="' + this.pointerLength_ + '" x="' + (50 - this.strokeWidth_/2) + '" y="' + (50 + this.pointerDistanceFromCenter_) + '"/>');

	var thisRef = this;

	this.$svg_.on("mousedown", function (e) {
		thisRef.onSVGMouseDown_(e);
	});

	this.$svg_.on("touchstart", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onSVGMouseDown_(e);
	});

	$(document).on("mousemove", function (e) {
		thisRef.onDocMouseMove_(e);
	});

	this.$svg_.on("touchmove", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onDocMouseMove_(e);
	});

	$(document).on("mouseup touchend", function (e) {
		thisRef.onDocMouseUp_(e);
	});

	this.$valueField_ = $('<input type="text" disabled>').addClass(this.classNameValueField_).addClass("synth-input-camouflage");
	this.$element_.append($("<div>").append(this.$valueField_));

	this.setPosition(0);

};
synth.inherits(synth.html.RotaryControl, synth.Observable);

synth.html.RotaryControl.prototype.get$Element = function () {
  return this.$element_;
};

synth.html.RotaryControl.prototype.createDots_ = function () {
	var alpha, x, y;
	for(var i=0; i<this.dots_.length; i++) {
		alpha = (this.spareDegrees/2 + (360-this.spareDegrees)*this.dots_[i]);
		x = -Math.sin(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		y = Math.cos(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		this.$svg_.html(this.$svg_.html() + '<circle cx="' + x +'" cy="' + y +'" r="' + this.dotRadius + '" />');
	}
};

synth.html.RotaryControl.prototype.onSVGMouseDown_ = function (e) {
	this.mouseMove_ = true;
	this.lastY_ = e.pageY;
	e.preventDefault();
};

synth.html.RotaryControl.prototype.onDocMouseMove_ = function (e) {
	if(this.mouseMove_) {
		var distance = this.lastY_ - e.pageY;
		var newValue = Math.max(0, Math.min(this.position_ + distance*this.resolution, 1));
		this.setPosition(newValue);
		this.lastY_ = e.pageY;
	}
};

synth.html.RotaryControl.prototype.onDocMouseUp_ = function (e) {
	this.mouseMove_ = false;
};

synth.html.RotaryControl.prototype.getValue = function () {
	return this.value_;
};

synth.html.RotaryControl.prototype.setValue = function (value) {
  var oldValue = this.value_;
  this.value_ = value;
  this.fireEvent("change:value", {oldValue: oldValue});
};

synth.html.RotaryControl.prototype.setPosition = function (position) {

  //var oldValue = this.position_;
  this.position_ = position;

  var transformString = "rotate(" + (this.spareDegrees/2 + (360-this.spareDegrees)*position)  + " 50 50)";
  this.$svg_.children("."+this.classNamePointer_).attr("transform", transformString);

  this.updateValueFromPosition();
};


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

synth.html.AnalogRotaryControl = function(opt_options) {
  opt_options = opt_options || {};

  this.min_ = opt_options.min || 0;
  this.max_ = opt_options.max || 1;

  if (opt_options.hasOwnProperty("logarithmic") && opt_options.logarithmic) {
    this.mappingFunction_ = function (x) {
      return min/Math.E * Math.exp(Math.log(max*math.E/min)*x);
    };
    this.inverseMappingFunction_ = function (y) {
      return Math.log(y*Math.E/min) / Math.log(max*Math.E/min);
    };
  } else {
    this.mappingFunction_ = this.inverseMappingFunction_ = function (value) { return value; };
  }

	synth.html.RotaryControl.call(this, opt_options);

  this.dots_ = [0,1];
  this.createDots_();

  this.displayPrecision_ = opt_options.displayPrecision_ || 2;
  this.unit_ = opt_options.unit || "";
  this.setEditable(opt_options.editable || true);

  this.setValue(opt_options.initial || 0);
  this.updatePositionFromValue();
};
synth.inherits(synth.html.AnalogRotaryControl, synth.html.RotaryControl);

synth.html.AnalogRotaryControl.prototype.setValue = function (value) {
  synth.html.RotaryControl.prototype.setValue.call(this, value);

  var displayValue = value.toFixed(this.displayPrecision_);
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
        this.setValue(input);
        this.updatePositionFromValue();
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
  this.setValue(this.mappingFunction_(this.min_ + this.position_ * (this.max_ - this.min_)));
};

synth.html.AnalogRotaryControl.prototype.updatePositionFromValue = function () {
  this.setPosition(this.inverseMappingFunction_(this.value_ / (this.max_ - this.min_) - this.min_));
};


/**
 * DiscreteRotaryControl
 * @class
 *
 *
 */

synth.html.DiscreteRotaryControl = function(opt_options) {
  opt_options = opt_options || {};

  this.valueIndex_ = 0;

  synth.html.RotaryControl.call(this, opt_options);

  this.setValueArray(opt_options.values || [0, 1]);

  this.setValue(opt_options.initial || this.values_[0]);

  this.updatePositionFromValue();
};
synth.inherits(synth.html.DiscreteRotaryControl, synth.html.RotaryControl);

synth.html.DiscreteRotaryControl.prototype.setValueArray = function (valueArray) {

  this.length_ = valueArray.length;

  this.values_ = valueArray;

  this.dots_ = [];

  for(var i=0; i<this.length_; i++) {
    this.dots_.push(1/(this.length_-1)*i);
  }

  this.createDots_();

  this.updateValueFromPosition();
};

synth.html.DiscreteRotaryControl.prototype.updateValueFromPosition = function () {

  if (this.values_) {
    var findNearest = function (start, end) {
      if (end-start > 1) {
        var middle = start + Math.floor((end-start)/2);
        if (this.position_ <= this.dots_[middle]) {
          return findNearest(start, middle);
        } else {
          return findNearest(middle, end);
        }
      } else if (end-start === 1) {
        if (this.position_ - this.dots_[start] < this.dots_[end] - this.position_) {
          return start;
        } else {
          return end;
        }
      } else {
         return start;
      }
    }.bind(this);

    this.valueIndex_ = findNearest(0, this.length_-1);
    this.setValue(this.values_[this.valueIndex_]);

    this.$valueField_.val(this.getValue());
  }
};

synth.html.DiscreteRotaryControl.prototype.updatePositionFromValue = function () {
  this.valueIndex_ = this.values_.indexOf(this.getValue());
  this.setPosition(this.dots_[this.valueIndex_]);
};

synth.html.DiscreteRotaryControl.prototype.onDocMouseUp_ = function (e) {
  synth.html.RotaryControl.prototype.onDocMouseUp_.call(this, e);

  this.setPosition(this.dots_[this.valueIndex_]);
};



// #endif
