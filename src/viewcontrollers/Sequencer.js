// #ifndef __VIEWCONTROLLERSEQUENCER__
// #define __VIEWCONTROLLERSEQUENCER__

// #include "ViewController.js"
// #include "../players/OneBarStepSequencer.js"

synth.viewController.Sequencer = function (clock, opt_options) {

	opt_options = opt_options || {};

  opt_options.sequencerOptions = opt_options.sequencerOptions || {};
  this.cols_ = opt_options.cols || 8;
  this.rows_ = opt_options.rows || 8;
  opt_options.sequencerOptions.steps = this.cols_;

  this.player = new synth.player.OneBarStepSequencer(clock, opt_options.sequencerOptions);

	this.className_ = opt_options.className || "synth-sequencer";

	synth.viewController.ViewController.call(this, opt_options);


	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";

  var $buttonDiv = $("<div>").addClass(this.className_ + "-buttons");

	for (var i=0; i<this.rows_; i++) { // this.rows_
		for (var j=0; j<this.cols_; j++) { // this.cols_
			(function (row, col) {
				var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + j).addClass(this.classNameRow_ + "-" + i);
				$button.on("click", function () {
					var active = !$button.hasClass(this.classNameButtonActive_);
					$button.toggleClass(this.classNameButtonActive_);
					if (active) {
						this.player.addNote(col, this.rows_-row-1);
					} else {
						this.player.removeNote(col, this.rows_-row-1);
					}
				}.bind(this));
				$buttonDiv.append($button);
			}.bind(this))(i,j);
		}
	}

  this.$element_.append($buttonDiv);

  var $clearButton = $("<button>").addClass(this.className_ + "-clear").text("Clear").on("click", function () {
    this.player.clear();
    $buttonDiv.children().removeClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($clearButton);
};
synth.inherits(synth.viewController.Sequencer, synth.viewController.ViewController);


// #endif
