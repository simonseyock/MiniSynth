// #ifndef __ONEBARSTEPSEQUENCER__
// #define __ONEBARSTEPSEQUENCER__

// #include "../init.js"
// #include "Player.js"

synth.player.OneBarStepSequencer = function (clock, opt_steps) {
	synth.player.Player.call(this);
	
	this.clock_ = clock;
	
	//this.addNormalStateParameter("steps", this.getSteps, function (steps) { this.steps_ = steps; });
	//this.beats_ = opt_beats || 4;
	//this.noteValues_ = opt_noteValues || 4;
	
	this.steps_ = opt_steps || 4;
	
	this.notes_ = new synth.TimeCollection(0, this.steps_);
	this.stepLength_ = 1;
	
	this.clock_.on("change:bpm", function (e) {
		this.adjustTiming_();
	}.bind(this));
	
	this.clock_.on("tick", function (begin, end) {
		
	});
	
	//this.addNormalStateParameter("grainSize", this.getGrainSize, this.setGrainSize);
	//this.setGrainSize(opt_grainSize || 0);	
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);
synth.StateExchangeObject.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

synth.player.OneBarStepSequencer.prototype.playIntervall = function (begin, end) {
	var instrument = this.getInstrument();
	
	var grainSize = this.getGrainSize();
	var stepLength = barLength / grainSize;
	
	for( var i=0; i<this.steps_.length; i++) {
		for( var j=0; j<this.steps_[i].length; j++) {
			instrument.playNote(this.steps_[i][j], time + stepLength * i, stepLength, 100);
		}
	}
};

synth.player.OneBarStepSequencer.prototype.adjustTiming_ = function () {
	var oldStepLength = this.stepLength_;
	this.stepLength_ = (60 / this.clock_.getBpM()) * (4 / this.steps_);
	this.notes_ = this.notes_.timeMultiply(oldStepLength/this.stepLength_); // NOTE: this does not enforce a change in the playback!, that would have to be done with on("change:object") and a function that changes the values inside of the collection.
};


// synth.player.OneBarStepSequencer.prototype.setGrainSize = function (grainSize) {
	// if (this.steps_.length < grainSize) {
		// for (var i=0, ii=grainSize-this.steps_.length; i<ii; i++) {
			// this.steps_.push([]);
		// }
	// } else if (this.steps_.length > grainSize) {
		// this.steps.splice(grainSize, this.steps_.length - grainSize);
	// }
	// this.grainSize_ = grainSize;
// };

// synth.player.OneBarStepSequencer.prototype.getGrainSize = function () {
	// return this.grainSize_;
// };


// synth.player.OneBarStepSequencer.prototype.getSteps = function () {
	// return this.steps_;
// };

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.steps_[stepIndex].push(value);
};

synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var index = this.steps_[stepIndex].indexOf(value);
	if (index > -1) {
		this.steps_[stepIndex].splice(index, 1);
	}
};



// #endif