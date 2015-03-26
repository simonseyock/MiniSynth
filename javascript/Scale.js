// #ifndef __SCALE__
// #define __SCALE__

/**
 * An abstract Scale class
 * @class
 * @abstract
 */
synth.Scale = function () {
	synth.StateExchange.call(this);
	
	//this.addExchangeObjectArrayStateParameter("lines", this.getLines, this.setLines);
};
synth.inherits(synth.Scale, synth.StateExchange);
//synth.StateExchange.addType("synth.Scale", synth.Scale);

synth.Scale.prototype.getFrequency = synth.abstractFunction;


/**
 * An equal tempered Scale class
 * @class
 */
synth.EqualTemperedScale = function (index, frequency) {
	synth.Scale.call(this);
	
	this.factor_ = Math.pow(2, 1/12);
	
	this.addNormalStateParameter("baseFrequency", function () { return this.baseFrequency_ }, function (value) { this.baseFrequency_ = value; });
	this.baseFrequency_ = frequency / Math.pow(this.factor_, index);
	
};
synth.inherits(synth.EqualTemperedScale, synth.Scale);
synth.StateExchange.addType("synth.EqualTemperedScale", synth.EqualTemperedScale);

synth.EqualTemperedScale.prototype.getFrequency = function (index) {
	return this.baseFrequency_ * Math.pow(this.factor_, index);
};

// #endif