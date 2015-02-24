// #ifndef __SCALE__
// #define __SCALE__

// #include "init.js"

/**
 *	
 */
synth.Scale = function () {
	synth.StateExchangeObject.call(this);
	
	//this.addExchangeObjectArrayStateParameter("lines", this.getLines, this.setLines);
};
synth.inherits(synth.Scale, synth.StateExchangeObject);
//synth.StateExchangeObject.addType("synth.Scale", synth.Scale);

synth.Scale.prototype.getNote = synth.abstractFunction;



synth.EqualTemperedScale = function (index, frequency) {
	synth.Scale.call(this);
	
	this.factor_ = Math.pow(2, 1/12);
	
	this.addNormalStateParameter("baseFrequency", function () { return this.baseFrequency_ }, function (value) { this.baseFrequency_ = value; });
	this.baseFrequency_ = frequency / Math.pow(this.factor_, index);
	
};
synth.inherits(synth.EqualTemperedScale, synth.Scale);
synth.StateExchangeObject.addType("synth.EqualTemperedScale", synth.EqualTemperedScale);

synth.EqualTemperedScale.prototype.getNote = function (index) {
	return this.baseFrequency_ * Math.pow(this.factor_, index);
};

// #endif