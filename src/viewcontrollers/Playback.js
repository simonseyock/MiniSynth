// #ifndef __PLAYBACKVIEWCONTROLLER__
// #define __PLAYBACKVIEWCONTROLLER__

// #include "ViewController.js"
// #include "../Clock.js"
// #include "../html/NumberInputFieldWithValueDrag.js"
// #include "../svgs.js"

synth.viewController.Playback = function (audioContext, opt_options) {

	opt_options = opt_options || {};

	this.clock = new synth.Clock(audioContext, opt_options.clockOptions);

	this.className_ = opt_options.className || "synth-playback";
  this.classNameActive_ = "synth-active";

	synth.viewController.ViewController.call(this, opt_options);

  var $playButton, $stopButton, $bpmDiv;

  // PLAYBUTTON
	$playButton = $("<button>").addClass(this.className_ + "-play").append(synth.svgs.play);
	$playButton.on("click", function () {
    if(!this.clock.started) {
		  this.clock.start();
    }
	}.bind(this));
	this.$element_.append($playButton);

  this.clock.on("start", function () {
    $playButton.addClass(this.classNameActive_);
    $stopButton.removeClass(this.classNameActive_);
    //this.running_ = true;
  }.bind(this));

  //STOPBUTTON
	$stopButton = $("<button>").addClass(this.className_ + "-stop").append(synth.svgs.stop);
  $stopButton.addClass(this.classNameActive_);
	$stopButton.on("click", function () {
    if (this.clock.started) {
		  this.clock.stop();
    } else {
      this.clock.interrupt();
    }
	}.bind(this));
	this.$element_.append($stopButton);

  this.clock.on("stop", function () {
    $stopButton.addClass(this.classNameActive_);
    $playButton.removeClass(this.classNameActive_);
  }.bind(this));

  // KEYBOARD CONTROLS

  $(document).on("keydown", function (e) {
    if (e.which === 32) { //space
      // TOGLE PLAY/PAUSE
      if (!this.clock.started) {
        this.clock.start();
      } else {
        this.clock.stop();
      }
      e.preventDefault();
    } else if (e.which === 27) { //esc
      this.clock.interrupt();
    }
  }.bind(this));

  //BPM

	$bpmDiv = $("<div>").addClass(this.className_ + "-bpm");
  var bpmField = new synth.html.NumberInputFieldWithValueDrag({resolution: 0.7, displayPrecision: 2});
	bpmField.setValue(this.clock.getBpM());

	bpmField.on("input", function () {
		this.clock.setBpM(parseFloat(bpmField.getValue()));
	}.bind(this));

  this.clock.on("tempoChange", function () {
    bpmField.setValue(this.clock.getBpM());
  }.bind(this));

	$bpmDiv.append(bpmField.get$Element()).append("BpM");
	this.$element_.append($bpmDiv);
};
synth.inherits(synth.viewController.Playback, synth.viewController.ViewController);
// #endif
