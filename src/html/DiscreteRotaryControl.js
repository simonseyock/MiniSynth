// #ifndef __DISCRETEROTARYCONTROL__
// #define __DISCRETEROTARYCONTROL__

// #include "RotaryControl.js"

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
  if (this.mouseMove_) {
    this.setPosition(this.dots_[this.valueIndex_]);
  }

  synth.html.RotaryControl.prototype.onDocMouseUp_.call(this, e);
};

// #endif
