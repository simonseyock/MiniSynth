// #ifndef __CHESSBOARDSEQUENCERCONTROLLER__
// #define __CHESSBOARDSEQUENCERCONTROLLER__

// #include "init.js"
// #include "ChessBoardSequencer.js"
// #include "SequencerChessBoardView.js"

synth.ChessboardSequencerController = function (viewoptions) {
	var that = this;
	
	this.player_ = new synth.player.ChessBoardSequencer();
	this.view_ = new synth.SequencerChessBoardView(viewoptions);
	
	for (var i=0; i<8; i++) {
		for (var j=0; j<8; j++) {
			(function (row, col) {
				that.view_.get$Field(row, col).on("click", function () {
					that.player_.toggleNote(row, col);
				});
			})(i, j);
		}
	}
};

synth.ChessboardSequencerController.prototype.getPlayer = function () {
	return this.player_;
}

// #endif