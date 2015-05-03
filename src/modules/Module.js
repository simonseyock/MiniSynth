// #ifndef __MODULE__
// #define __MODULE__

// #include "../Connectable.js"
// #include "../StateExchangable.js"

synth = synth || {};
synth.module = synth.module || {};

synth.module.Module = function (audioContext) {
  synth.Connectable.call(this);
  synth.StateExchangable.call(this);
  synth.Observable.call(this);

  this.audioContext_ = audioContext;
};
synth.inherits(synth.module.Module, synth.Connectable);
synth.inherits(synth.module.Module, synth.StateExchangable);
synth.inherits(synth.module.Module, synth.Observable);


// #endif
