// #ifndef __ROTARYCONTROL__
// #define __ROTARYCONTROL__

// #include "../Observable.js"

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


// #endif
