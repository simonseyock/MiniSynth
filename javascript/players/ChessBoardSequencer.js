// #ifndef __CHESSBOARDSEQUENCER__
// #define __CHESSBOARDSEQUENCER__

// #include "../init.js"
// #include "OneBarStepSequencer.js"

synth.player.ChessBoardSequencer = function () {
	synth.player.OneBarStepSequencer.call(this, 8);
	
	this.notes_ = [0,2,4,5,7,9,11,12];
	
	this.board_ = [];
	for (var i=0; i<8; i++) { // rows
		this.board_.push([]);
		for (var j=0; j<8; j++) { // cols
			this.board_[i].push(false);
		}
	}
};
synth.inherits(synth.player.ChessBoardSequencer, synth.player.OneBarStepSequencer);
synth.StateExchangeObject.addType("synth.player.ChessBoardSequencer", synth.player.ChessBoardSequencer);

synth.player.ChessBoardSequencer.prototype.toggleNote = function (row, col) {
	var newValue = !this.board_[row][col];
	this.board_[row][col] = newValue;
	if(newValue) {
		this.addNote(col, this.notes_[7-row]);
	} else {
		this.removeNote(col, this.notes_[7-row]);
	}
};

// #endif