// #ifndef __ONEBARSTEPSEQUENCER__
// #define __ONEBARSTEPSEQUENCER__

// #include "Player.js"

synth.player.OneBarStepSequencer = function (clock, opt_steps) {
	synth.player.Player.call(this);
	
	this.clock_ = clock;
	
	//this.addNormalStateParameter("steps", this.getSteps, function (steps) { this.steps_ = steps; });
	
	this.steps_ = opt_steps || 4;
	
	this.notes_ = [];
	for (var i=0; i<this.steps_; i++) {
		this.notes_.push([]);
	}
	
	this.stepLength_ = this.clock_.getBarLength() / this.steps_;
	
	this.clock_.on("tempoChange", function (multiplier) {
		this.getInstrument().changeTempo(multiplier);
		this.stepLength_ *= multiplier;
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
synth.StateExchange.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

synth.player.OneBarStepSequencer.prototype.playBar = function (bar, when) {
	for (var i=0; i<this.steps_; i++) {
		this.notes_[i].forEach(function (value) {
			this.getInstrument().addNote({ time: when + i * this.stepLength_, duration: this.stepLength_, value: value });
		}.bind(this));
	}
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.notes_[stepIndex].push(value);
	
	if (this.clock_.started) {
		var timeObject = { time: stepIndex*this.stepLength_, duration: this.stepLength_, value: value };
		var barLength = this.clock_.getBarLength();
		var timeCollection = new synth.TimeCollection(0, 2 * barLength);
		timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject));
		this.getInstrument().addNotes(timeCollection.timeAdd(this.nextBarTime_));
	}
};

synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var index = this.notes_[stepIndex].indexOf(value);
	
	if (index > -1) {
		this.notes_[stepIndex].splice(index,1);
		
		if (this.clock_.started) {
			var timeObject = { time: stepIndex*this.stepLength_, duration: this.stepLength_, value: value };
			var barLength = this.clock_.getBarLength();
			var timeCollection = new synth.TimeCollection(0, 2 * barLength);
			timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject)).timeAdd(this.nextBarTime_);
			this.getInstrument().removeNotes(timeCollection);
		}
	}
};

synth.player.OneBarStepSequencer.prototype.clear = function () {
	for (var i=0; i<this.steps_; i++) {
		this.notes_[i] = [];
	}
	this.getInstrument().interrupt();
};
// #endif