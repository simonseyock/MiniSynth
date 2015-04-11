// #ifndef __VIEWCONTROLLERSEQUENCER__
// #define __VIEWCONTROLLERSEQUENCER__

// #include "ViewController.js"

synth.viewController.Sequencer = function (sequencer, rows, cols, opt_options) {

	this.sequencer_ = sequencer;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-sequencer";

	synth.viewController.ViewController.call(this, opt_options);


	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";

  var $buttonDiv = $("<div>").addClass(this.className_ + "-buttons");

	for (var i=0; i<rows; i++) { // rows
		for (var j=0; j<cols; j++) { // cols
			(function (row, col) {
				var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + j).addClass(this.classNameRow_ + "-" + i);
				$button.on("click", function () {
					var active = !$button.hasClass(this.classNameButtonActive_);
					$button.toggleClass(this.classNameButtonActive_);
					if (active) {
						this.sequencer_.addNote(col, rows-row-1);
					} else {
						this.sequencer_.removeNote(col, rows-row-1);
					}
				}.bind(this));
				$buttonDiv.append($button);
			}.bind(this))(i,j);
		}
	}

  this.$element_.append($buttonDiv);

  var $clearButton = $("<button>").addClass(this.className_ + "-clear").text("Clear").on("click", function () {
    this.sequencer_.clear();
    $buttonDiv.children().removeClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($clearButton);
};
synth.inherits(synth.viewController.Sequencer, synth.viewController.ViewController);


// #endif
