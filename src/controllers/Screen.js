// #ifndef __CONTROLLERSCREEN__
// #define __CONTROLLERSCREEN__

// #include "Controller.js"

synth.controller.Screen = function (opt_options) {

  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-screens";
  synth.controller.Controller.call(this, opt_options);

  this.$screens_ = [];
  this.titles_ = [];

  this.activeScreen_ = 0;

  this.$button_ = $("<button>").text("Switch Screen").on("click", function (e) {
    if (this.activeScreen_ == 1) {
      this.changeScreen(-1);
      this.$button_.text("Switch to " + this.titles_[1]);
    } else {
      this.changeScreen(1);
      this.$button_.text("Switch to " + this.titles_[0]);
    }
  }.bind(this));

  this.$element_.append(this.$button_);
};
synth.inherits(synth.controller.Screen, synth.controller.Controller);

synth.controller.Screen.prototype.addScreen = function($newScreen, title) {

  if(this.$screens_.length > 0) {
    $newScreen.hide();
    this.$button_.text("Switch to " + title);
  }

  this.titles_.push(title);
  this.$screens_.push($newScreen);
  this.$element_.append($newScreen);
};

synth.controller.Screen.prototype.changeScreen = function(diff) {
  var newPosition = Math.max(0, Math.min(this.activeScreen_ + diff, this.$screens_.length-1));

  this.$screens_[this.activeScreen_].hide();
  this.activeScreen_ = newPosition;
  this.$screens_[this.activeScreen_].show();
};

// #endif
