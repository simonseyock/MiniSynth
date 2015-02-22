// #ifndef __CHESSBOARDSEQUENCER__
// #define __CHESSBOARDSEQUENCER__

// #include "init.js"
// #include "Player.js"

synth.player.ChessBoardSequencer = function (internal_typeName) {
	synth.player.Player.call(this, internal_typeName || "synth.player.ChessBoardSequencer");
	
	this.chessBoard_ = [];
	for (var i=0; i<8; i++) {
		this.chessBoard_[i] = [];
		for (var j=0; j<8; j++) {
			this.chessBoard_[i][j] = false;
		}
	}
	this.frequencies_ = [];
};
synth.inherits(synth.player.ChessBoardSequencer, synth.player.Player);

synth.player.ChessBoardSequencer.prototype.setFrequencies = function (frequencies) {
	this.frequencies_ = frequencies;
};

synth.player.ChessBoardSequencer.prototype.getFrequencies = function () {
	return this.frequencies_;
};

synth.player.ChessBoardSequencer.prototype.setBoard = function (board) {
	this.chessBoard_ = board;
};

synth.player.ChessBoardSequencer.prototype.getBoard = function () {
	return this.chessBoard_;
};

synth.player.ChessBoardSequencer.prototype.setField = function (time, note, value) {
	this.chessBoard
};
// #endif