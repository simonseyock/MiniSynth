//(function () {

// #include "init.js"
// #include "OneBarStepSequencer.js"
// #include "MultiOscillator.js"
// #include "InstrumentLine.js"
// #include "GlobalMerger.js"
// #include "Scale.js"

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var scaleC3 = new synth.EqualTemperedScale(21, 440)

var stepSequencer = new synth.player.OneBarStepSequencer(8);
stepSequencer.addValue(0, scaleC3.getFrequency(0  + 0));
stepSequencer.addValue(1, scaleC3.getFrequency(0  + 0));
stepSequencer.addValue(1, scaleC3.getFrequency(4  + 0));
stepSequencer.addValue(1, scaleC3.getFrequency(7  + 0));
stepSequencer.addValue(2, scaleC3.getFrequency(9  + 0));
stepSequencer.addValue(2, scaleC3.getFrequency(12 + 0));
stepSequencer.addValue(2, scaleC3.getFrequency(16 + 0));
stepSequencer.addValue(3, scaleC3.getFrequency(9  + 0));
stepSequencer.addValue(4, scaleC3.getFrequency(0  +12));
stepSequencer.addValue(5, scaleC3.getFrequency(0  +12));
stepSequencer.addValue(5, scaleC3.getFrequency(4  +12));
stepSequencer.addValue(5, scaleC3.getFrequency(7  +12));
stepSequencer.addValue(6, scaleC3.getFrequency(9  +12));
stepSequencer.addValue(6, scaleC3.getFrequency(12 +12));
stepSequencer.addValue(6, scaleC3.getFrequency(16 +12));
stepSequencer.addValue(7, scaleC3.getFrequency(9  +12));

var multiOscillator = new synth.instrument.MultiOscillator(audioCtx, "sine", 4);

var line = new synth.InstrumentLine(audioCtx);
line.setPlayer(stepSequencer);
line.setInstrument(multiOscillator);

var globalMerger = new synth.GlobalMerger(audioCtx);
globalMerger.addLine(line);

globalMerger.connect(audioCtx.destination);
globalMerger.gain_.gain.value = 0.7;

//multiOscillator.simpleOscillators_[0].playFrequency(scaleC3.getFrequency(0  +12), audioCtx.currentTime+1, 1/2);
multiOscillator.start(audioCtx.currentTime+1);

stepSequencer.playNextBar(audioCtx.currentTime+2, 2);
stepSequencer.playNextBar(audioCtx.currentTime+4, 2);
stepSequencer.playNextBar(audioCtx.currentTime+6, 2);
stepSequencer.playNextBar(audioCtx.currentTime+8, 2);
//})();