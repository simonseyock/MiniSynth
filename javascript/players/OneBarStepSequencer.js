// #ifndef __ONEBARSTEPSEQUENCER__
// #define __ONEBARSTEPSEQUENCER__

// #include "../init.js"
// #include "Player.js"

synth.player.OneBarStepSequencer = function (clock, opt_steps) {
	synth.player.Player.call(this);
	
	this.clock_ = clock;
	
	//this.addNormalStateParameter("steps", this.getSteps, function (steps) { this.steps_ = steps; });
	
	this.steps_ = opt_steps || 4;
	
	this.notes_ = new synth.TimeCollection(0, this.clock_.getBarLength());
	this.stepLength_ = this.clock_.getBarLength() / this.steps_;
	
	this.clock_.on("tempoChange", function (multiplier) {
		this.getInstrument().changeTempo(multiplier);
		this.stepLength_ *= multiplier;
		this.notes_.timeMultiply(multiplier);
	}.bind(this));
	
	this.nextBarTime_ = 0;
	
	this.clock_.on("nextBar", function (bar, when) {
		this.nextBarTime_ = when;
		this.playBar(bar, when);
	}.bind(this));
	
	this.clock_.on("stop", function (when) {
		this.getInstrument().interrupt(when);
	}.bind(this));
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);
synth.StateExchangeObject.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

synth.player.OneBarStepSequencer.prototype.playBar = function (bar, when) {
	this.getInstrument().addNotes(this.notes_.clone().timeAdd(when));
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	var timeObject = { time: this.stepLength_ * stepIndex, duration: this.stepLength_, value: value };
	
	this.notes_.insert(timeObject);
	
	if (this.clock_.started) {
		var barLength = this.clock_.getBarLength();
		var timeCollection = new synth.TimeCollection(0, 2 * barLength);
		timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject));
		this.getInstrument().addNotes(timeCollection.timeAdd(this.nextBarTime_));
	}
};

synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var timeObject = { time: this.stepLength_ * stepIndex, duration: this.stepLength_, value: value };
	
	this.notes_.remove(timeObject);
	
	if (this.clock_.started) {
		var barLength = this.clock_.getBarLength();
		var timeCollection = new synth.TimeCollection(0, 2 * barLength);
		timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject));
		this.getInstrument().removeNotes(timeCollection.timeAdd(this.nextBarTime_));
	}
};

synth.player.OneBarStepSequencer.prototype.clear = function () {
	var notesToRemove = this.notes_.clone();
	notesToRemove.forEach(function (timeObject) {
		this.notes_.remove(timeObject);
	}.bind(this));
};
// #endif