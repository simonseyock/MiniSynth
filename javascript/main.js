//(function () {

$(document).ready(function () {
	// #include "init.js"
	// #include "ChessboardSequencerController.js"
	// #include "MultiOscillator.js"
	// #include "InstrumentLine.js"
	// #include "GlobalMerger.js"
	// #include "Scale.js"
	// #include "Clock.js"


	window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	window.scaleC3 = new synth.EqualTemperedScale(21, 440)

	// window.player = new synth.player.OneBarplayer(8);
	// window.player.addNote(0, (0  + 0));
	// window.player.addNote(1, (0  + 0));
	// window.player.addNote(1, (4  + 0));
	// window.player.addNote(1, (7  + 0));
	// window.player.addNote(2, (9  + 0));
	// window.player.addNote(2, (12 + 0));
	// window.player.addNote(2, (16 + 0));
	// window.player.addNote(3, (9  + 0));
	// window.player.addNote(4, (0  +12));
	// window.player.addNote(5, (0  +12));
	// window.player.addNote(5, (4  +12));
	// window.player.addNote(5, (7  +12));
	// window.player.addNote(6, (9  +12));
	// window.player.addNote(6, (12 +12));
	// window.player.addNote(6, (16 +12));
	// window.player.addNote(7, (9  +12));

	window.chessBoard = new synth.ChessboardSequencerController({ $target: $("#chessboard")});
	
	window.multiOscillator = new synth.instrument.MultiOscillator(window.audioCtx, "square", 4, window.scaleC3);

	window.line = new synth.InstrumentLine(window.audioCtx);
	window.player = window.chessBoard.getPlayer();
	window.line.setPlayer(window.player);
	window.line.setInstrument(window.multiOscillator);

	window.globalMerger = new synth.GlobalMerger(window.audioCtx);
	window.globalMerger.addLine(window.line);

	window.globalMerger.connect(window.audioCtx.destination);
	window.globalMerger.gain_.gain.value = 0.2;

	//window.multiOscillator.simpleOscillators_[0].playFrequency((0  +12), window.audioCtx.currentTime+1, 1/2);
	window.multiOscillator.start(audioCtx.currentTime+1);

	window.clock = new synth.Clock(audioCtx);
	clock.registerPlayer(player);
	clock.start();

	//})();

});