// #ifndef __CONTROLLERMAIN__
// #define __CONTROLLERMAIN__

// #include "Controller.js"
// #include "Playback.js"
// #include "Sequencer.js"
// #include "Synthesizer.js"
// #include "Screen.js"

synth.controller.Main = function (opt_options) {

  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-main";

  synth.controller.Controller.call(this, opt_options);

  this.audioContext_ = new (window.AudioContext || window.webkitAudioContext)();

  this.playbackController_ = new synth.controller.Playback(this.audioContext_);
  this.playerController_ = new synth.controller.Sequencer(this.playbackController_.clock);
  this.instrumentController_ = new synth.controller.Synthesizer(this.audioContext_);
  this.playerController_.player.setInstrument(this.instrumentController_.instrument);

  this.screenController_ = new synth.controller.Screen();

  this.$element_.append(this.playbackController_.get$Element());
  this.screenController_.addScreen(this.playerController_.get$Element(), "Sequencer");
  this.screenController_.addScreen(this.instrumentController_.get$Element(), "Synthesizer");
  this.$element_.append(this.screenController_.get$Element());

  this.instrumentController_.instrument.connect(this.audioContext_.destination);
};
synth.inherits(synth.controller.Main, synth.controller.Controller);

// #endif
