// #ifndef __MODULE__
// #define __MODULE__

synth.instrument = synth.instrument || {};
synth.instrument.module = synth.instrument.module || {};

synth.instrument.module.Module = function (audioContext) {
  this.audioContext_ = audioContext;

  this.input = null;
  this.output = null;
};

synth.instrument.module.Module.prototype.connect = function (node) {
  if(node.hasOwnProperty("input")) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

// #endif
