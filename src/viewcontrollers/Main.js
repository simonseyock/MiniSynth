// #ifndef __VIEWCONTROLLERMAIN__
// #define __VIEWCONTROLLERMAIN__

// #include "ViewController.js"
// #include "Playback.js"
// #include "Sequencer.js"
// #include "Synthesizer.js"
// #include "Screen.js"

synth.viewController.Main = function (opt_options) {

  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-main";

  synth.viewController.ViewController.call(this, opt_options);

  this.audioContext_ = new (window.AudioContext || window.webkitAudioContext)();

  this.playbackController_ = new synth.viewController.Playback(this.audioContext_);
  this.playerController_ = new synth.viewController.Sequencer(this.playbackController_.clock);
  this.instrumentController_ = new synth.viewController.Synthesizer(this.audioContext_);
  this.playerController_.player.setInstrument(this.instrumentController_.instrument);

  this.screenController_ = new synth.viewController.Screen();

  this.screenController_.addScreen($("<div>").append(this.playbackController_.get$Element()).append(this.playerController_.get$Element()));
  this.screenController_.addScreen(this.instrumentController_.get$Element());
  this.$element_.append(this.screenController_.get$Element());

  this.instrumentController_.gain.module.connect(this.audioContext_.destination);
};
synth.inherits(synth.viewController.Main, synth.viewController.ViewController);

// #endif
