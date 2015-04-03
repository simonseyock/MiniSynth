// #ifndef __PLAYBACKVIEWCONTROLLER__
// #define __PLAYBACKVIEWCONTROLLER__

// #include "ViewController.js"
// #include "html/InputFieldWithValueDrag.js"
// #include "svgs.js"

synth.viewController.Playback = function (clock, opt_options) {

	opt_options = opt_options || {};

	this.clock_ = clock;

	this.className_ = opt_options.className || "synth-playback";
  this.classNameActive_ = "synth-active";

	synth.viewController.ViewController.call(this, opt_options);

  var $playButton, $stopButton, $bpmDiv;

  // PLAY
	$playButton = $("<button>").addClass(this.className_ + "-play").append(synth.svgs.play);
	$playButton.on("click", function () {
		this.clock_.start();
	}.bind(this));
	this.$element_.append($playButton);

  this.clock_.on("start", function () {
    $playButton.addClass(this.classNameActive_);
    $stopButton.removeClass(this.classNameActive_);
  }.bind(this));

  //STOP
	$stopButton = $("<button>").addClass(this.className_ + "-stop").append(synth.svgs.stop);
  $stopButton.addClass(this.classNameActive_);
	$stopButton.on("click", function () {
		this.clock_.stop();
	}.bind(this));
	this.$element_.append($stopButton);

  this.clock_.on("stop", function () {
    $stopButton.addClass(this.classNameActive_);
    $playButton.removeClass(this.classNameActive_);
  }.bind(this));

  //BPM
	$bpmDiv = $("<div>").addClass(this.className_ + "-bpm");
	var bpmField = new synth.html.InputFieldWithValueDrag(0.7);
	bpmField.setValue(this.clock_.getBpM());

	bpmField.on("input", function () {
		this.clock_.setBpM(parseFloat(bpmField.getValue()));
	}.bind(this));

  this.clock_.on("tempoChange", function () {
    bpmField.setValue(this.clock_.getBpM());
  }.bind(this));

	$bpmDiv.append(bpmField.get$Element()).append("BpM");
	this.$element_.append($bpmDiv);

  //
};
synth.inherits(synth.viewController.Playback, synth.viewController.ViewController);
// #endif
