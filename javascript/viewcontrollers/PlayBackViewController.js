// #ifndef __PLAYBACKVIEWCONTROLLER__
// #define __PLAYBACKVIEWCONTROLLER__

// #include "ViewController.js"
// #include "../html/InputFieldWithValueDrag.js"
// #include "../svgs.js"

synth.viewController.Playback = function (clock, opt_options) {

	opt_options = opt_options || {};

	this.clock_ = clock;

	this.className_ = opt_options.className || "synth-playback";

	synth.viewController.ViewController.call(this, opt_options);

	var $playButton = $("<button>").addClass(this.className_ + "-play").append(synth.svgs.play);
	$playButton.on("click", function () {
		this.clock_.start();
	}.bind(this));
	this.$element_.append($playButton);

	var $stopButton = $("<button>").addClass(this.className_ + "-stop").append(synth.svgs.stop);
	$stopButton.on("click", function () {
		this.clock_.stop();
	}.bind(this));
	this.$element_.append($stopButton);

	var $bpmDiv = $("<div>").addClass(this.className_ + "-bpm");
	var bpmField = new synth.html.InputFieldWithValueDrag(0.7);
	bpmField.setValue(this.clock_.getBpM());

	bpmField.on("input", function () {
		this.clock_.setBpM(parseFloat(bpmField.getValue()));
		bpmField.setValue(this.clock_.getBpM());
	}.bind(this));

	$bpmDiv.append(bpmField.get$Element()).append("BpM");
	this.$element_.append($bpmDiv);
};
synth.inherits(synth.viewController.Playback, synth.viewController.ViewController);
// #endif
