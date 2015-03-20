// #ifndef __INSTRUMENT__
// #define __INSTRUMENT__

// #include "../init.js"
// #include "../StateExchangeObject.var.js"

// NOTE: At the moment instrument doesn't support live playing of a note

synth.instrument = synth.instrument || {};

synth.instrument.Instrument = function (audioContext, scale) {
	synth.StateExchangeObject.call(this);
	
	this.audioContext_ = audioContext;
	
	this.frequenciesToPlay = new synth.TimeCollection(0, 0); // May not be overriden! NOTE: maybe using a defineProperty here?
	
	this.addExchangeObjectStateParameter("scale", this.getScale, this.setScale);
	this.setScale(scale);
};
synth.inherits(synth.instrument.Instrument, synth.StateExchangeObject);
synth.StateExchangeObject.addType("synth.instrument.Instrument", synth.instrument.Instrument);

synth.instrument.Instrument.prototype.addFrequency = function (timeObject) {
	this.frequenciesToPlay.insert(timeObject);
	
	var curTime = this.audioContext_.currentTime;
	this.frequenciesToPlay.before(curTime, false).forEach(function (timeObject) {
		if (timeObject.time + timeObject.duration < curTime) {
			this.frequenciesToPlay.remove(timeObject);
		}
	}.bind(this));
};

synth.instrument.Instrument.prototype.addFrequencies = function (frequencyTimeCollection) {
	frequencyTimeCollection.forEach(function (timeObject) {
		this.addFrequency(timeObject);
	}.bind(this));
};

synth.instrument.Instrument.prototype.addNote = function (timeObject) {
	var newTimeObject = _.cloneDeep(timeObject);
	newTimeObject.value = this.scale_.getFrequency(timeObject.value);
	this.addFrequency(newTimeObject);
};

synth.instrument.Instrument.prototype.addNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.addNote(timeObject)
	}.bind(this));
};

synth.instrument.Instrument.prototype.removeFrequency = function (timeObject) {
	this.frequenciesToPlay.remove(timeObject);
};

synth.instrument.Instrument.prototype.removeFrequencies = function (frequencyTimeCollection) {
	frequencyTimeCollection.forEach(function (timeObject) {
		this.removeFrequency(timeObject);
	}.bind(this));
};

synth.instrument.Instrument.prototype.removeNote = function (timeObject) {
	var newTimeObject = _.cloneDeep(timeObject);
	timeObject.value = this.scale_.getFrequency(timeObject.value);
	this.removeFrequency(timeObject);
};

synth.instrument.Instrument.prototype.removeNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.removeNote(timeObject);
	}.bind(this));
};

synth.instrument.Instrument.prototype.changeTempo = function (tempoMultiplier, when) {
	this.frequenciesToPlay.afterEqual(when, true).forEach(function (timeObject) {
		timeObject.time = (timeObject - when) * tempoMultiplier + when;
		timeObject.duration *= tempoMultiplier;
	});
};

synth.instrument.Instrument.prototype.connect = synth.abstractFunction;

synth.instrument.Instrument.prototype.interrupt = synth.abstractFunction;

synth.instrument.Instrument.prototype.setScale = function (scale) {
	this.scale_ = scale;
};

synth.instrument.Instrument.prototype.getScale = function () {
	return this.scale_;
};

// #endif