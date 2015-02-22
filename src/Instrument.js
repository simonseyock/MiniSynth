// #ifndef __INSTRUMENT__
// #define __INSTRUMENT__

// #include "init.js"

synth.instrument = synth.instrument || {};

synth.instrument.Instrument = function () {
	synth.StateExchangeObject.call(this);
};
synth.inherits(synth.instrument.Instrument, synth.StateExchangeObject);
synth.StateExchangeObject.addType("synth.instrument.Instrument", synth.instrument.Instrument);

synth.instrument.Instrument.prototype.playFrequency = synth.abstractFunction;

synth.instrument.Instrument.prototype.connect = synth.abstractFunction;

// #endif