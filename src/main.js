//(function () {

// #include "init.js"
// #include "OneBarStepSequencer.js"
// #include "SimpleOscillator.js"
// #include "InstrumentLine.js"
// #include "GlobalMerger.js"

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var stepSequencer = new synth.player.OneBarStepSequencer(8);
stepSequencer.addValue(0, 440);
stepSequencer.addValue(3, 420);
stepSequencer.addValue(5, 460);

var simpleOscillator = new synth.instrument.SimpleOscillator(audioCtx);

var line = new synth.InstrumentLine(audioCtx);
line.setPlayer(stepSequencer);
line.setInstrument(simpleOscillator);

var globalMerger = new synth.GlobalMerger(audioCtx);
globalMerger.addLine(line);

globalMerger.connect(audioCtx.destination);

//simpleOscillator.playFrequency(404, audioCtx.currentTime+1, 1/2);

stepSequencer.playNextBar(audioCtx.currentTime+1, 2);
//})();