// #ifndef __ONEBARSTEPSEQUENCER__
// #define __ONEBARSTEPSEQUENCER__

// #include "../init.js"
// #include "Player.js"

synth.player.OneBarStepSequencer = function (opt_grainSize) {
	synth.player.Player.call(this);
	
	this.addNormalStateParameter("steps", this.getSteps, function (steps) { this.steps_ = steps; });
	this.steps_ = [];
	
	this.addNormalStateParameter("grainSize", this.getGrainSize, this.setGrainSize);
	this.setGrainSize(opt_grainSize || 0);	
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);
synth.StateExchangeObject.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

synth.player.OneBarStepSequencer.prototype.setGrainSize = function (grainSize) {
	if (this.steps_.length < grainSize) {
		for (var i=0, ii=grainSize-this.steps_.length; i<ii; i++) {
			this.steps_.push([]);
		}
	} else if (this.steps_.length > grainSize) {
		this.steps.splice(grainSize, this.steps_.length - grainSize);
	}
	this.grainSize_ = grainSize;
};

synth.player.OneBarStepSequencer.prototype.getGrainSize = function () {
	return this.grainSize_;
};


synth.player.OneBarStepSequencer.prototype.getSteps = function () {
	return this.steps_;
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.steps_[stepIndex].push(value);
};

synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var index = this.steps_[stepIndex].indexOf(value);
	if (index > -1) {
		this.steps_[stepIndex].splice(index, 1);
	}
};

synth.player.OneBarStepSequencer.prototype.playBar = function (time, barLength) {
	var instrument = this.getInstrument();
	var grainSize = this.getGrainSize();
	var stepLength = barLength / grainSize;
	
	for( var i=0; i<this.steps_.length; i++) {
		for( var j=0; j<this.steps_[i].length; j++) {
			instrument.playNote(this.steps_[i][j], time + stepLength * i, stepLength, 100);
		}
	}
};

// #endif