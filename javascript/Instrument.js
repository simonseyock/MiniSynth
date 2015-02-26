// #ifndef __INSTRUMENT__
// #define __INSTRUMENT__

// #include "init.js"
// #include "StateExchangeObject.var.js"

synth.instrument = synth.instrument || {};

synth.instrument.Instrument = function (scale) {
	synth.StateExchangeObject.call(this);
	
	this.addExchangeObjectStateParameter("scale", this.getScale, this.setScale);
	this.scale_ = scale;
};
synth.inherits(synth.instrument.Instrument, synth.StateExchangeObject);
synth.StateExchangeObject.addType("synth.instrument.Instrument", synth.instrument.Instrument);

synth.instrument.Instrument.prototype.playFrequency = synth.abstractFunction;

synth.instrument.Instrument.prototype.playNote = function (note, time, duration) {
	this.playFrequency(this.scale_.getFrequency(note), time, duration);
};

synth.instrument.Instrument.prototype.connect = synth.abstractFunction;

synth.instrument.Instrument.prototype.setScale = function (scale) {
	this.scale_ = scale;
};

synth.instrument.Instrument.prototype.getScale = function () {
	return this.scale_;
};

// #endif