// #ifndef __MODULE__
// #define __MODULE__

synth = synth || {};
synth.module = synth.module || {};

synth.module.Module = function (audioContext) {
  this.audioContext_ = audioContext;

  this.input = null;
  this.output = null;
};

synth.module.Module.prototype.connect = function (node) {
  if(node.hasOwnProperty("input")) {
    this.connect(node.input);
  } else {
    this.output.connect(node);
  }
};

// #endif
