// #ifndef __TEMPOTAPCONTROLLER__
// #define __TEMPOTAPCONTROLLER__

// #include "Controller.js"
// #include "../Clock.js"

synth.controller.TempoTap = function (clock, opt_options) {

	opt_options = opt_options || {};

	this.clock = clock;

	this.className_ = opt_options.className || "synth-tempotap";
  this.classNameActive_ = "synth-active";

  this.taps_ = opt_options.taps || 4;

  var counter = 0;
  var times = [];
  var lastTime;

  var $tapButton = $("<button>").addClass(this.className_);

  var setText = function() {
    $tapButton.text("TAP (" + (this.taps_-counter) + "x)");
  }.bind(this);

  setText();

  $tapButton.on("click", function () {
    counter++;

    var now = Date.now();
    if (counter > 1) {
      times.push(now-lastTime);
    }
    lastTime = now;

    if (counter == 1) {
      $tapButton.addClass(this.classNameActive_);
    } else if (counter == this.taps_) {
      //var avg = _.sum(times)/(this.taps_-1);
      var avg = _.reduce(times, function(tot, n) { return tot + n; })/(this.taps_-1);
      clock.setBpM(60000 / avg);
      times = [];
      counter = 0;
      $tapButton.removeClass(this.classNameActive_);
    }
    setText();
	}.bind(this));

  opt_options.$element = $tapButton;

  synth.controller.Controller.call(this, opt_options);
};
synth.inherits(synth.controller.TempoTap, synth.controller.Controller);

// #endif
