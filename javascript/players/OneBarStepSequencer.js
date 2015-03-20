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
	
	this.clock_.on("nextBar", function (bar, when) {
		this.playBar(bar, when);
	}.bind(this));
	
	this.clock_.on("stop", function (when) {
		this.getInstrument().interrupt(when);
	}.bind(this));
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);
synth.StateExchangeObject.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

synth.player.OneBarStepSequencer.prototype.playBar = function (bar, when) {
	this.getInstrument().playNotes(this.notes_.clone().timeAdd(when));
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.notes_.insert({ time: this.stepLength_ * stepIndex, duration: this.stepLength_, value: value });
};

synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	this.notes_.remove({ time: this.stepLength_ * stepIndex, duration: this.stepLength_, value: value });
};

// #endif