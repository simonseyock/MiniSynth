// #ifndef __VIEWCONTROLLERSCREEN__
// #define __VIEWCONTROLLERSCREEN__

// #include "ViewController.js"

synth.viewController.Screen = function (opt_options) {

  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-screens";
  synth.viewController.ViewController.call(this, opt_options);

  this.$screens_ = [];
  this.activeScreen_ = 0;
};
synth.inherits(synth.viewController.Screen, synth.viewController.ViewController);

synth.viewController.Screen.prototype.addScreen = function($newScreen) {

  if(this.$screens_.length > 0) {
    $newScreen.hide();
  }

  this.$screens_.push($newScreen);
  this.$element_.append($newScreen);
};

synth.viewController.Screen.prototype.changeScreen = function(diff) {
  var newPosition = Math.max(0, Math.min(this.$screens_.length + diff, this.$screens_.length));

  this.$screens_[this.activeScreen_].hide();
  this.activeScreen_ = newPosition;
  this.$screens_[this.activeScreen_].show();
};

// #endif
