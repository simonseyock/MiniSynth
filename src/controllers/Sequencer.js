// #ifndef __CONTROLLERSEQUENCER__
// #define __CONTROLLERSEQUENCER__

// #include "Controller.js"
// #include "../players/OneBarStepSequencer.js"

synth.controller.Sequencer = function (clock, opt_options) {

	opt_options = opt_options || {};

  opt_options.sequencerOptions = opt_options.sequencerOptions || {};
  this.cols_ = opt_options.cols || 8;
  this.rows_ = opt_options.rows || 8;
  opt_options.sequencerOptions.steps = this.cols_;

  this.player = new synth.player.OneBarStepSequencer(clock, opt_options.sequencerOptions);

	this.className_ = opt_options.className || "synth-sequencer";

	synth.controller.Controller.call(this, opt_options);

  this.storageController_ = new synth.controller.Storage({ storageKey: "sequencer", stateExchangable: this.player });

  this.$element_.append(this.storageController_.get$Element());

	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";

  var $buttonDiv = $("<div>").addClass(this.className_ + "-buttons");

  this.$buttons_ = []; // 2 dimensional

  for (var col=0; col<this.cols_; col++) {
    this.$buttons_.push([]);
    for (var row=0; row<this.rows_; row++) {
      (function (cCol, cRow) {
        var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + col).addClass(this.classNameRow_ + "-" + (this.rows_-row-1));
				$button.on("click", function () {
				  this.player.toggleNote(cCol, cRow);
				}.bind(this));
				$buttonDiv.append($button);
        this.$buttons_[col].push($button);
      }.bind(this))(col, row);
    }
  }

  this.player.on("toggleField", function (e) {
    this.$buttons_[e.col][e.row].toggleClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($buttonDiv);

  var $clearButton = $("<button>").addClass(this.className_ + "-clear").text("Clear").on("click", function () {
    this.player.clear();
    $buttonDiv.children().removeClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($("<div>").addClass(this.className_ + "-clear").append($clearButton));
};
synth.inherits(synth.controller.Sequencer, synth.controller.Controller);


// #endif
