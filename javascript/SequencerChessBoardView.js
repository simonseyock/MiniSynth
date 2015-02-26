// #ifndef __SEQUENCERCHESSBOARDVIEW
// #define __SEQUENCERCHESSBOARDVIEW

// #include "init.js"
// #include "View.js"

synth.SequencerChessBoardView = function (opt_options) {

	var that = this;
	
	opt_options = opt_options || {};
	opt_options.className = opt_options.className || "synth-sequencer-chessboard";
	
	synth.View.call(this, opt_options);
	
	
	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";
	
	
	this.$buttons_ = [];

	for (var i=0; i<8; i++) {
		this.$buttons_.push([]);
		for (var j=0; j<8; j++) {
			var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + j).addClass(this.classNameRow_ + "-" + i);
			(function (row, col) {
				$button.on("click", function (active) {
					that.$buttons_[row][col].toggleClass(that.classNameButtonActive_);
				});
			})(i,j);
			this.$buttons_[i].push($button);
			this.$element_.append($button);
		}
	}
};

synth.SequencerChessBoardView.prototype.get$Field = function (row, col) {
	var that = this;
	return this.$buttons_[row][col];
};

// #endif