// #ifndef __ONEBARSTEPSEQUENCER__
// #define __ONEBARSTEPSEQUENCER__

// #include "Player.js"
// #include "../Scales.js"

synth.player.OneBarStepSequencer = function (clock, opt_options) {
	synth.player.Player.call(this);

	this.clock_ = clock;

	this.steps_ = opt_options.steps || 4;

  this.baseNoteIndex_ = opt_options.baseNoteIndex || 48; // C3

  //this.startingNoteIndex_ = opt_options.startingNoteIndex || 0;

  this.intervals_ = opt_options.intervals || synth.scales.intervals.major;

	this.notes_ = []; // 2 dimensional
	for (var i=0; i<this.steps_; i++) {
		this.notes_.push([]);
	}

	this.stepLength_ = this.clock_.getBarLength() / this.steps_;

	this.clock_.on("tempoChange", function (multiplier) {
		this.getInstrument().changeTempo(multiplier, this.clock_.currentTime());
		this.stepLength_ *= multiplier;
	}.bind(this));

	this.nextBarTime_ = 0;

	this.clock_.on("nextBar", function (bar, when) {
		this.nextBarTime_ = when;
		this.playBar(bar, when);
	}.bind(this));

	this.clock_.on("stop", function (when) {
		this.getInstrument().pause(when);
	}.bind(this));

  this.clock_.on("interrupt", function () {
    this.getInstrument().interrupt();
  }.bind(this));

  this.registerEventType("toggleField");
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);

synth.player.OneBarStepSequencer.prototype.playBar = function (bar, when) {
	for (var i=0; i<this.steps_; i++) {
		this.notes_[i].forEach(function (value) {
      var note = {
        time: when + i * this.stepLength_,
        duration: this.stepLength_,
        value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
      };
			this.getInstrument().addNote(note);
		}.bind(this));
	}
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.notes_[stepIndex].push(value);

	if (this.clock_.started) {
		var timeObject = {
      time: stepIndex*this.stepLength_,
      duration: this.stepLength_,
      value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
    };
		var barLength = this.clock_.getBarLength();
		var timeCollection = new synth.TimeCollection(0, 2 * barLength);
		timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject));
		this.getInstrument().addNotes(timeCollection.timeAdd(this.nextBarTime_));
	}

  this.fireEvent("toggleField", [{ col: stepIndex, row: value }]);
};


synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var index = this.notes_[stepIndex].indexOf(value);

	if (index > -1) {
		this.notes_[stepIndex].splice(index,1);

		if (this.clock_.started) {
			var timeObject = {
        time: stepIndex*this.stepLength_,
        duration: this.stepLength_,
        value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
      };
			var barLength = this.clock_.getBarLength();
			var timeCollection = new synth.TimeCollection(0, 2 * barLength);
			timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject)).timeAdd(this.nextBarTime_);
			this.getInstrument().removeNotes(timeCollection);
		}
	}

  this.fireEvent("toggleField", [{ col: stepIndex, row: value }]);
};

synth.player.OneBarStepSequencer.prototype.toggleNote = function (stepIndex, value) {
  var index = this.notes_[stepIndex].indexOf(value);
  if (index > -1) {
    this.removeNote(stepIndex, value);
  } else {
    this.addNote(stepIndex, value);
  }
};

synth.player.OneBarStepSequencer.prototype.clear = function () {
	for (var i=this.steps_-1; i>=0; i--) {
    for(var j=this.notes_[i].length-1; j>=0; j--) {
      this.removeNote(i, this.notes_[i][j]);
    }
	}
};

synth.player.OneBarStepSequencer.prototype.getState = function () {
  var state = synth.player.Player.prototype.getState.call(this);
  //state.steps = this.steps_; // NOTE: this is not updatable
  state.baseNoteIndex = this.baseNoteIndex_;
  state.intervals = _.cloneDeep(this.intervals_);
  state.notes = _.cloneDeep(this.notes_);
  return state;
};

synth.player.OneBarStepSequencer.prototype.setState = function (state) {
  synth.player.Player.prototype.setState.call(this, state);
  this.baseNoteIndex_ = state.baseNoteIndex;
  this.intervals_ = state.intervals;
  this.clear();
  state.notes.forEach(function (column, index) {
    column.forEach(function (note) {
      this.addNote(index, note);
    }.bind(this));
  }.bind(this));
};
// #endif
