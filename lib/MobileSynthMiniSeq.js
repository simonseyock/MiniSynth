/*
 * This file is the main assembly file for the project. Maintaining all available parts.
 */

window.synth = window.synth || {};

(function () {

var synth = window.synth;
/*
 * This file contains structural helper functions
 */

synth.inherits = function (child, parent) {
	jQuery.extend(child.prototype, parent.prototype);
};

synth.abstractFunction = function () {
	throw new Error("You tried to call an abstract function. Yuck.");
};



// NOTE: Question: (important) How to prevent Circles? (difficult) How to reduce Redundancy?

synth.StateExchange = function () {
	this.state_ = {};
};

synth.StateExchange.stateExchangeFactory_ = {
	prototypes: [],
	addType: function (name, aPrototype) {
		this.prototypes[name] = aPrototype;
	},
	createObject: function (name) {
		if(name in this.prototypes) {
			return new this.prototypes[name]();
		} else {
			return {};
		}
	}
};

synth.StateExchange.addType = function (typeName, aPrototype) {
	synth.StateExchange.stateExchangeFactory_.addType(typeName, aPrototype);
};

/**
 * @param name {string}
 * @param getter {function} should return valid JSON (http://json.org)
 * @parma setter {function}
 */
synth.StateExchange.prototype.addNormalStateParameter = function (name, getter, setter) {
	this.state_[name] = { get: getter, set: setter };
};

/**
 * @param name {string}
 * @param getter {function} should return a {synth.StateExchange} !
 * @parma setter {function} should accept a {synth.StateExchange}
 */
synth.StateExchange.prototype.addExchangeObjectStateParameter = function (name, getter, setter) {
	this.state_[name] = { 
		get: function() { 
			return { type: getter().typeName, state: getter().getState() };
		}, 
		set: function(typedState) { 
			// insert validation if obj is already of the same type here
			var obj = synth.StateExchange.stateExchangeFactory_.createObject(typedState.typeName);
			obj.setState(typedState.state);
			setter(obj);
		}
	};
};

/**
 * @param name {string}
 * @param getter {function} should return a {synth.StateExchange[]} !
 * @parma setter {function} should accept a {synth.StateExchange[]}
 */
synth.StateExchange.prototype.addExchangeObjectArrayStateParameter = function (name, getter, setter) {
	this.state_[name] = { 
		get: function() {
			var retArr = [];
			var stateExchangeObjects = getter();
			for (var i=0; stateExchangeObjects.length; i++) {
				retArr.push({ type: stateExchangeObjects[i].typeName, state: stateExchangeObjects.getState() });
			}
			return retArr;
		}, 
		set: function(typedStates) { 
			// insert validation if obj is already of the same type here
			var setArr = [];
			for (var i=0; typedStates.length; i++) {
				setArr.push(synth.StateExchange.stateExchangeFactory_ .createObject(typedStates[i].typeName));
			}
			obj.setState(typedState.state);
			setter(obj);
		}
	};
};

/**
 * @returns {JSON} (if all setted values where valid json)
 */

synth.StateExchange.prototype.getState = function (opt_parameter) {
	if (opt_parameter) {
		// insert validation if opt_parameter is in state
		return this.state_[opt_parameter].get();
	} else {
		var state = {};
		for (var key in this.state_) {
			state[key] = this.state_.get();
		}
		return state;
	} 
	
	return undefined;
};

/**
 * @param value {JSON} needs to be plain JSON! If (look it up on http://json.org)
 */

synth.StateExchange.prototype.setState = function (opt_parameter, value) {
	// shuffle arguments ;)
	if (arguments.length === 1) {
		value = arguments[0];
		opt_parameter = undefined;
	}
	
	if (opt_parameter) {
		this.state_[opt_parameter].set( value );
	} else {
		for (key in value) {
			this.state_[key].set(value[key]);
		}
	}	
};



synth.instrument = synth.instrument || {};

/**
 * This is the base class for all instruments, providing a common interface.
 * All base classes only need to listen for inserts and removes on the frequenciesToPlay TimeCollection property to get informed aboput all new frequencies
 * @class
 */
// NOTE: At the moment instrument doesn't support live playing of a note
synth.instrument.Instrument = function (audioContext, frequencyTable) {
	synth.StateExchange.call(this);

	this.audioContext_ = audioContext;

	this.frequenciesToPlay = new synth.TimeCollection(0, 0); // May not be overriden! NOTE: maybe using a defineProperty here?

	//this.addExchangeObjectStateParameter("scale", this.getScale, this.setScale);
	this.frequencyTable_ = frequencyTable;
};
synth.inherits(synth.instrument.Instrument, synth.StateExchange);
synth.StateExchange.addType("synth.instrument.Instrument", synth.instrument.Instrument);

/**
 *
 * @method
 */
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
	newTimeObject.value = this.frequencyTable_[timeObject.value];
	this.addFrequency(newTimeObject);
};

synth.instrument.Instrument.prototype.addNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.addNote(timeObject)
	}.bind(this));
};


/**
 *
 * @method
 */
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
	timeObject.value = this.frequencyTable_[timeObject.value];
	this.removeFrequency(timeObject);
};

synth.instrument.Instrument.prototype.removeNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.removeNote(timeObject);
	}.bind(this));
};

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.changeTempo = function (tempoMultiplier, when) {

  // notes which already started at the time of the tempo change only need to be changed in length
  this.frequenciesToPlay.atTime(when).forEach(function (timeObject) {
    var modifiedPart = (timeObject.time + timeObject.duration - when) * tempoMultiplier;
    var originalPart = when - timeObject.time;
    timeObject.duration = originalPart + modifiedPart;
  });

  // notes which start afterwards need to be changed both in time and duration
	this.frequenciesToPlay.after(when, false).forEach(function (timeObject) {
    //var old = _.cloneDeep(timeObject);
		timeObject.time = (timeObject.time - when) * tempoMultiplier + when;
		timeObject.duration *= tempoMultiplier;
    //this.frequenciesToPlay.fireEvent("objectChanged",[{old: old, new: timeObject}]);
	}.bind(this));
};

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.connect = synth.abstractFunction;

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.interrupt = synth.abstractFunction;



synth.instrument.ModularSynth = function (audioContext, frequencyTable) {

  //opt_options = opt_options || {};

	//synth.StateExchange.call(this);

  synth.instrument.Instrument.call(this, audioContext, frequencyTable);

  this.modules_ = [];

};
synth.inherits(synth.instrument.ModularSynth, synth.instrument.Instrument);

synth.instrument.ModularSynth.prototype.addModule = function (aModule) {
  this.modules_.push(aModule);
  if(aModule.watch) {
    aModule.watch(this.frequenciesToPlay);
  }
};

synth.instrument.ModularSynth.prototype.pause = function (when) {
  this.modules_.forEach(function (aModule) {
    if(aModule.pause) {
      aModule.pause(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.interrupt = function () {
  this.modules_.forEach(function (aModule) {
    if(aModule.interrupt) {
      aModule.interrupt();
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);

  this.modules_.forEach(function (aModule) {
    if(aModule.updateTiming) {
      aModule.updateTiming(when);
    }
  }.bind(this));
};



synth = synth || {};
synth.module = synth.module || {};

synth.module.Module = function (audioContext) {
  this.audioContext_ = audioContext;

  this.input = null;
  this.output = null;
};

synth.module.Module.prototype.connect = function (node) {
  if(node.hasOwnProperty("input")) {
    this.connect(node.input);
  } else {
    this.output.connect(node);
  }
};



(function () {

  var SingleSoundGenerator = function (audioContext, timeObject, waveType, envelope) {
    this.audioContext_ = audioContext;

    this.waveType_ = waveType || "sine";
    this.timeObject = timeObject;
    this.envelope_ = envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };
    this.oscillator_ = null;

    this.envelopeShaper_ = audioContext.createGain();
    this.createOscillator_();

    this.oscillator_.connect(this.envelopeShaper_);
    this.updateTiming();

    //envelope (implemented with a gain node)

    this.output = this.envelopeShaper_;
  };
  synth.inherits(SingleSoundGenerator, synth.module.Module);

  SingleSoundGenerator.prototype.createOscillator_ = function () {

    if (this.oscillator_) {
      this.oscillator_.stop(0);
      this.oscillator_.disconnect();
    }

    this.oscillator_ = this.audioContext_.createOscillator();
    this.oscillator_.frequency.value = this.timeObject.value;
    this.oscillator_.type = this.waveType_;
    this.oscillator_.connect(this.envelopeShaper_);

    if (this.audioContext_.currentTime < this.timeObject.time + this.timeObject.duration) {

      this.realEndTime_ = this.timeObject.time + this.timeObject.duration + this.envelope_.release;

      if (this.audioContext_.currentTime < this.timeObject.time) {
        this.startTime_ = this.timeObject.time;
      } else {
        this.startTime_ = this.audioContext_.currentTime;
      }

      this.oscillator_.start(this.startTime_);
      this.oscillator_.stop(this.realEndTime_);

      //console.log("oscillator stops at %s", this.realEndTime_); //DEBUG

      this.started_ = true;
    }
  };

  SingleSoundGenerator.prototype.shapeEnvelope_ = function () {

    var currentTime = this.audioContext_.currentTime;
    var nominalEndTime = this.timeObject.time + this.timeObject.duration;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    var attackCanFinish = false;
    var decayCanFinish = false;

    if (currentTime <= nominalEndTime + this.envelope_.release) {
      if (currentTime <= nominalEndTime) {
        if (currentTime <= this.startTime_ + this.envelope_.attack + this.envelope_.decay) {
          if (currentTime <= this.startTime_ + this.envelope_.attack) {
            if (currentTime <= this.startTime_) {
              // Note start
              this.envelopeShaper_.gain.setValueAtTime(0, this.startTime_);
              //console.log("0 at %s", this.startTime_); //DEBUG
            }

            // Attack
            // is the note longer than the attack time?
            if (this.startTime_ + this.envelope_.attack <= nominalEndTime) {
              this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.startTime_ + this.envelope_.attack);
              //console.log("linear Ramp to %s at %s", 1, this.startTime_ + this.envelope_.attack); //DEBUG
              attackCanFinish = true;
            } else {
              var part = (nominalEndTime - this.startTime_) / this.envelope_.attack;
              this.envelopeShaper_.gain.linearRampToValueAtTime(part, nominalEndTime);
              //console.log("linear Ramp to %s at %s", part, this.startTime_ + this.envelope_.attack); //DEBUG
              attackCanFinish = false;
            }
          }

          // Decay
          // is note longer than attack time plus decay time?
          if (attackCanFinish) {
            if (this.startTime_ + this.envelope_.attack + this.envelope_.decay <= nominalEndTime) {
              this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope_.sustain, this.startTime_ + this.envelope_.attack + this.envelope_.decay);
              //console.log("linear Ramp to %s at %s", this.envelope_.sustain, this.startTime_ + this.envelope_.attack + this.envelope_.decay); //DEBUG
              decayCanFinish = true;
            } else {
              var part = (nominalEndTime - this.startTime_ - this.envelope_.attack) / this.envelope_.decay;
              this.envelopeShaper_.gain.linearRampToValueAtTime(part * this.envelope_.sustain, nominalEndTime);
              //console.log("linear Ramp to %s at %s", part * this.envelope_.sustain, this.startTime_ + this.envelope_.attack + this.envelope_.decay); //DEBUG
              decayCanFinish = false;
            }
          }
        }

        // Sustain
        if (attackCanFinish && decayCanFinish) {
          this.envelopeShaper_.gain.setValueAtTime(this.envelope_.sustain, nominalEndTime);
          //console.log("%s at %s", this.envelope_.sustain, nominalEndTime); //DEBUG
        }
      }

      // Release
      this.envelopeShaper_.gain.linearRampToValueAtTime(0, nominalEndTime + this.envelope_.release);
      //console.log("linear Ramp to %s at %s", 0, nominalEndTime + this.envelope_.release); //DEBUG
    }

  };

  SingleSoundGenerator.prototype.updateTiming = function () {
    this.startTime_ = this.timeObject.time;
    this.realEndTime_ = this.timeObject.time + this.timeObject.duration + this.envelope_.release;

    if (this.audioContext_.currentTime <= this.startTime_) {
      this.createOscillator_();
    } else {
      if(this.started_) {
        this.oscillator_.stop(this.realEndTime_);
        //console.log("oscillator stops at %s", this.realEndTime_); //DEBUG
      }
    }

    this.shapeEnvelope_();
  };

  SingleSoundGenerator.prototype.isFinished = function () {
    return this.audioContext_.currentTime > this.realEndTime_;
  };


  SingleSoundGenerator.prototype.setWaveType = function (waveType) {
    this.waveType_ = waveType;
    this.oscillator_.type = waveType;
  };

  SingleSoundGenerator.prototype.dispose = function (immediately) {

    var stopNow = function () {
      if (this.oscillator_) {
        if(this.started_) {
          this.oscillator_.stop(this.audioContext_.currentTime);
        }
        this.oscillator_.disconnect();
        this.oscillator_ = null;
      }
      if (this.envelopeShaper_) {
        this.envelopeShaper_.gain.cancelScheduledValues(this.audioContext_.currentTime);
        this.envelopeShaper_.disconnect();
        this.envelopeShaper_ = null;
      }
      this.output = null;
      this.started_ = false;
    }.bind(this);


    if (immediately) {

      stopNow();
    } else {

      if(this.started_) {
        this.oscillator_.stop(this.audioContext_.currentTime + this.envelope_.release);
        this.envelopeShaper_.gain.cancelScheduledValues(this.audioContext_.currentTime);
        this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.audioContext_.currentTime + this.envelope_.release);
      }

      setTimeout(stopNow, this.envelope_.release * 1000);
    }
  };



  synth.module.SoundGenerator = function (audioContext, opt_options) {
    this.audioContext_ = audioContext;

    opt_options = opt_options || {};

    this.gain_ = audioContext.createGain();

    this.waveType_ = opt_options.waveType || "sine";

    //this.voices_ = 8;

    //this.voiceCollections_ = [];

    this.singleSoundGenerators_ = [];

    this.envelope_ = opt_options.envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };

    this.setGain(opt_options.gain || 1);

    this.output = this.gain_;
  };
  synth.inherits(synth.module.SoundGenerator, synth.module.Module);

  synth.module.SoundGenerator.prototype.disposeFinishedSingleSoundGenerators_ = function () {
    for(var i=this.singleSoundGenerators_.length-1; i >= 0; i--) {
      if(this.singleSoundGenerators_[i].isFinished()) {
        this.singleSoundGenerators_[i].dispose(true);
        this.singleSoundGenerators_.splice(i,1);
      }
    }
  };

  synth.module.SoundGenerator.prototype.watch = function (collection) {

    collection.on("insert", function (timeObject) {
      this.disposeFinishedSingleSoundGenerators_();
      var sSG = new SingleSoundGenerator(this.audioContext_, timeObject, this.waveType_, this.envelope_);
      this.singleSoundGenerators_.push(sSG);
      sSG.connect(this.gain_);
    }.bind(this));

    collection.on("remove", function (timeObject) {
      this.disposeFinishedSingleSoundGenerators_();
      for(var i=this.singleSoundGenerators_.length-1, found=false; i >= 0 && !found; i--) {
        if(helpers.timeObjectsEqual(this.singleSoundGenerators_[i].timeObject, timeObject)) {
          found = true;
          this.singleSoundGenerators_[i].dispose();
        }
      };
    }.bind(this));
  };

  synth.module.SoundGenerator.prototype.pause = function (when) {
    // pause doesn't support continuation at the moment
    when = when || 0;
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.dispose(false);
    });
    //this.singleSoundGenerators_ = [];
  };

  synth.module.SoundGenerator.prototype.interrupt = function () {
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.dispose(true);
    });
    //this.singleSoundGenerators_ = [];
  };

  synth.module.SoundGenerator.prototype.getWaveType = function () {
    return this.waveType_;
  };

  synth.module.SoundGenerator.prototype.setWaveType = function (waveType) {
    this.waveType_ = waveType;
    this.disposeFinishedSingleSoundGenerators_();
    this.singleSoundGenerators_.forEach(function (sSG) {
       sSG.setWaveType(waveType);
    });
  };

  synth.module.SoundGenerator.prototype.getGain = function () {
    return this.gain_.gain.value;
  };

  synth.module.SoundGenerator.prototype.setGain = function (gain) {
    this.gain_.gain.value = gain;
  };

  synth.module.SoundGenerator.prototype.updateTiming = function () {
    this.disposeFinishedSingleSoundGenerators_();
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.updateTiming();
    });
  };

  synth.module.SoundGenerator.prototype.getAttack = function () {
    return this.envelope_.attack;
  };

  synth.module.SoundGenerator.prototype.setAttack = function (attack) {
    this.envelope_.attack = attack;
    this.updateTiming();
  };

  synth.module.SoundGenerator.prototype.getDecay = function () {
    return this.envelope_.decay;
  };

  synth.module.SoundGenerator.prototype.setDecay = function (decay) {
    this.envelope_.decay = decay;
    this.updateTiming();
  };

  synth.module.SoundGenerator.prototype.getSustain = function () {
    return this.envelope_.sustain;
  };

  synth.module.SoundGenerator.prototype.setSustain = function (sustain) {
    this.envelope_.sustain = sustain;
    this.updateTiming();
  };

  synth.module.SoundGenerator.prototype.getRelease = function () {
    return this.envelope_.release;
  };

  synth.module.SoundGenerator.prototype.setRelease = function (release) {
    this.envelope_.release = release;
    this.updateTiming();
  };

})();





/**
 *
 */

synth.module.Gain = function (audioContext, opt_options) {
  opt_options = opt_options || {};

	synth.module.Module.call(this, audioContext, opt_options);

  this.gainNode_ = audioContext.createGain();

  this.setGain(opt_options.gain || 1);

  this.input = this.output = this.gainNode_;
};
synth.inherits(synth.module.Gain, synth.module.Module);
//synth.StateExchange.addType("synth.MultiVoiceOscillator", synth.MultiVoiceOscillator);

synth.module.Gain.prototype.setGain = function (gain) {
  this.gainNode_.gain.value = gain;
};

synth.module.Gain.prototype.getGain = function () {
  return this.gainNode_.gain.value;
};




synth.module.Amount = function (audioContext, opt_options) {
  synth.module.Module.call(this, audioContext, opt_options);
  opt_options = opt_options || {};
  this.wet_ = this.audioContext_.createGain();
  this.dry_ = this.audioContext_.createGain();
  this.setAmount(opt_options.amount || 0);
  this.input = this.audioContext_.createGain();
  this.input.connect(this.dry_);
  this.output = this.audioContext_.createGain();
  this.wet_.connect(this.output);
  this.dry_.connect(this.output);
};
synth.inherits(synth.module.Amount, synth.module.Module);
synth.module.Amount.prototype.biConnectWetChain = function (wetChainIn, wetChainOut) {
  this.input.connect(wetChainIn);
  wetChainOut.connect(this.wet_);
};
synth.module.Amount.prototype.setAmount = function (amount) {
  this.amount_ = amount;
  this.wet_.gain.value = amount;
  this.dry_.gain.value = 1 - amount;
};
synth.module.Amount.prototype.getAmount = function () {
  return this.amount_;
};

/**
 *
 */
synth.module.PassFilter = function (audioContext, opt_options) {
	synth.module.Module.call(this, audioContext, opt_options);
  opt_options = opt_options || {};
  this.filter_ = this.audioContext_.createBiquadFilter();
  //this.filter_.frequency.value = 350;
  //this.filter_.Q.value = 1;
  this.amount_ = new synth.module.Amount(this.audioContext_, { amount:0 });
  this.amount_.biConnectWetChain(this.filter_, this.filter_);
  this.input = this.output = this.amount_;
};
synth.inherits(synth.module.PassFilter, synth.module.Module);
//synth.StateExchange.addType("synth.MultiVoiceOscillator", synth.MultiVoiceOscillator);
/* Type is either "lowpass", "highpass" or "bandpass" */
synth.module.PassFilter.prototype.getType = function () {
  return this.filter_.type;
};
synth.module.PassFilter.prototype.setType = function (type) {
  this.filter_.type = type;
};
synth.module.PassFilter.prototype.getFrequency = function () {
  return this.filter_.frequency.value;
};
synth.module.PassFilter.prototype.setFrequency = function (frequency) {
  this.filter_.frequency.value = frequency;
};
synth.module.PassFilter.prototype.getResonance = function () {
  return this.filter_.Q.value;
};
synth.module.PassFilter.prototype.setResonance = function (resonance) {
  this.filter_.Q.value = resonance;
};
synth.module.PassFilter.prototype.getAmount = function () {
  return this.amount_.getAmount();
};
synth.module.PassFilter.prototype.setAmount = function (amount) {
  return this.amount_.setAmount(amount);
};




synth.player = synth.player || {};

synth.player.Player = function () {
	synth.StateExchange.call(this);
	
	this.addExchangeObjectStateParameter("instrument", this.getInstrument, this.setInstrument);
};
synth.inherits(synth.player.Player, synth.StateExchange);

synth.player.Player.prototype.getInstrument = function () {
	return this.instrument_;
};

synth.player.Player.prototype.setInstrument = function (instrument) {
	this.instrument_ = instrument;
};

synth.player.Player.prototype.playIntervall = synth.abstractFunction;


synth.player.OneBarStepSequencer = function (clock, opt_options) {
	synth.player.Player.call(this);

	this.clock_ = clock;

	//this.addNormalStateParameter("steps", this.getSteps, function (steps) { this.steps_ = steps; });

	this.steps_ = opt_options.steps || 4;

  this.baseNoteIndex_ = opt_options.baseNoteIndex || 36; // C3

  //this.startingNoteIndex_ = opt_options.startingNoteIndex || 0;

  this.intervals_ = opt_options.intervals || synth.scales.intervals.major;

	this.notes_ = [];
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
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);
synth.StateExchange.addType("synth.player.OneBarStepSequencer", synth.player.OneBarStepSequencer);

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
};

synth.player.OneBarStepSequencer.prototype.clear = function () {
	for (var i=this.steps_-1; i>=0; i--) {
    for(var j=this.notes_[i].length-1; j>=0; j--) {
      this.removeNote(i, this.notes_[i][j]);
    }
	}
};



synth.viewController = synth.viewController || {};

synth.viewController.ViewController = function (opt_options) {

	opt_options = opt_options || {};
	
	this.$element_ = $("<div>").addClass(this.className_);
	
	if ("$target" in opt_options) {
		opt_options.$target.append(this.$element_);
	}
};

synth.viewController.ViewController.prototype.get$Element = function () {
	return this.$element_;
};

synth.viewController.ViewController.prototype.set$Target = function ($target) {
	$target.append(this.$element_);
};





synth.Observable = function ( opt_options ) {

    opt_options = opt_options || {};

    this.EventListeners_ = this.EventListeners_ || {};
    this.customKey_ = this.customKey_ || 0;
};

/**
 * This will register the event type and will prevent spelling mistakes ;)
 */

synth.Observable.prototype.registerEventType = function (type) {
    this.EventListeners_[type] = [];
};

/**
 * Fires all eventhandlers/listeners applied to the object with type type
 * Will not get passed to passClass.
 * @param {string} type type of the event f.e. "change"
 * @param {Array} passArgs an array of arguments which will be applied (using .apply) to the eventhandlers/listeners
 */

synth.Observable.prototype.fireEvent = function ( type, passArgs ) {

    if ( type in this.EventListeners_ ) {
        for (var i=0; i< this.EventListeners_[type].length; i++) {
            var listener = this.EventListeners_[type][i];

            var this_ = listener.opt_this || this;
            if (typeof(listener.listener) === "function" ) {
                listener.listener.apply( this_, passArgs );
            }

            if (listener.once) {
                this.EventListeners_[type].splice(i, 1);
                i--;
            }
        }
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

//synth.Observable.prototype.hasListenersOnEvent = function ( type ) {

//    if ( type in this.EventListeners_ ) {
//        return this.EventListeners_[type].length > 0;
//    } else {
//        throw "EventType: '" + type + "' doesn't exist!";
//    }
//};

/**
 * Registers a listener to fire every time the given event occurs
 * @method
 */
synth.Observable.prototype.on = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        var key = this.customKey_++;
        this.EventListeners_[type].push( { listener: listener, opt_this: opt_this, once: false, key: key } );
        return { type: type, key: key };
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Registers a listener to fire once the given event occurs
 * @method
 */
synth.Observable.prototype.once = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        var key = this.customKey_++;
        this.EventListeners_[type].push( { listener: listener, opt_this: opt_this, once: true, key: key } );
        return { type: type, key: key };
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Removes a given listener for an event
 * @method
 */
synth.Observable.prototype.un = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        for ( var i = 0; i < this.EventListeners_[type].length; i++ ) {

            if (this.EventListeners_[type][i].listener === listener) {
                this.EventListeners_[type].splice(i, 1);
                i--;
            }
        }
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Removes a listener identified by the key which is returned by on or once
 * @method
 */
synth.Observable.prototype.unByKey = function ( key ) {
    if ( "type" in key ) {
        if (key.type in this.EventListeners_) {
            for (var i=0; i< this.EventListeners_[key.type].length; i++) {

                if (this.EventListeners_[key.type][i].key === key.key) {
                    this.EventListeners_[key.type].splice(i, 1);
                    i--;
                }
            }
        } else {
            throw "EventType: '" + key.type + "' doesn't exist!";
        }
    } else {
        throw "invalid key: '" + key  + "'!";
    }
};



synth.html = synth.html || {};

synth.html.NumberInputField = function (opt_options) {
  opt_options = opt_options || {};

	synth.Observable.call(this);

  this.displayPrecision_ = opt_options.displayPrecision || 2;

	this.registerEventType("input");

	this.$element_ = $("<input>");
  this.setValue(opt_options.initial || 0);

	var valueBeforeEdit = null;

	var onFocus = function (e) {
		valueBeforeEdit = this.$element_.val();
	}.bind(this);

	var onBlur = function (e) {
    this.setValue(parseFloat(this.$element_.val()));
	}.bind(this);

	var onKeydown = function (e) {
		if(e.which === 13) { // enter
			this.$element_.blur();
		} else if (e.which === 27) { // escape
			this.$element_.val(valueBeforeEdit);
			this.$element_.blur();
		}
	}.bind(this);

	this.$element_.on("focus", onFocus);
	this.$element_.on("blur", onBlur);
	this.$element_.on("keydown", onKeydown);
};
synth.inherits(synth.html.NumberInputField, synth.Observable);

synth.html.NumberInputField.prototype.get$Element = function () {
	return this.$element_;
};

synth.html.NumberInputField.prototype.setValue = function (value) {
  var oldValue = this.value_;
  this.value_ = value;
	this.$element_.val(value.toFixed(this.displayPrecision_));
  this.fireEvent("input", [{oldValue: oldValue, newValue: value}]);
};

synth.html.NumberInputField.prototype.getValue = function () {
	return this.value_;
};



synth.html.NumberInputFieldWithValueDrag = function (opt_options) {
  opt_options = opt_options || {};

	synth.html.NumberInputField.call(this, opt_options);

	this.resolution_ = opt_options.resolution || 1;

	var drag = false;
	var lastY = null;
	//var lastTime = null;
	//var interval = null;

	//var positionY = 0;

	// var updateValue = function () {
		// var now = Date.now();
		// var distance = positionY - lastY;
		// var time = now - lastTime;

		// //distance is the velocity of the change
		// // newValue = oldValue + v/t * factor
		// this.$element_.val(parseFloat(this.$element_.val()) + distance/time * this.resolution_);
		// this.fireEvent("input");

		// lastTime = now;
	// }.bind(this);

  this.$element_.addClass("synth-input-camouflage");

	var onMouseDown = function (e) {
		drag = true;
		lastY = e.pageY;

		//positionY = this.$element_.offset().top + this.$element_.height() * 0.5;

		//interval = setInterval(updateValue, 50);
	}.bind(this);

	var onMouseMove = function (e) {
		if(drag) {
			var distance = lastY - e.pageY;

			this.setValue(parseFloat(this.$element_.val()) + distance * this.resolution_);

			lastY = e.pageY;
		}
	}.bind(this);

	var onMouseUp = function (e) {
		if(drag) {
			drag = false;
			//clearInterval(interval);
		}
	};

	this.$element_.on("mousedown", onMouseDown);
	$(document).on("mousemove", onMouseMove);
	$(document).on("mouseup", onMouseUp);

	this.$element_.on("touchstart", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		onMouseDown(e);
	});
	this.$element_.on("touchmove", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		onMouseMove_(e);
	});
	this.$element_.on("touchend", onMouseUp);
};
synth.inherits(synth.html.NumberInputFieldWithValueDrag, synth.html.NumberInputField);



synth.svgs = synth.svgs || {};

synth.svgs.play = '<svg viewBox = "0 0 100 100" version = "1.1" class="synth-svg-play"><path d = "M 25 0 L 25 100 L 75 50 L 25 0"></svg>';

synth.svgs.stop = '<svg viewBox = "0 0 100 100" version = "1.1" class="synth-svg-stop"><path d = "M 10 10 L 90 10 L 90 90 L 10 90 L 10 10"></svg>';


synth.viewController.Playback = function (clock, opt_options) {

	opt_options = opt_options || {};

	this.clock_ = clock;

	this.className_ = opt_options.className || "synth-playback";
  this.classNameActive_ = "synth-active";

	synth.viewController.ViewController.call(this, opt_options);

  var $playButton, $stopButton, $bpmDiv;

  // PLAYBUTTON
	$playButton = $("<button>").addClass(this.className_ + "-play").append(synth.svgs.play);
	$playButton.on("click", function () {
    if(!this.clock_.started) {
		  this.clock_.start();
    }
	}.bind(this));
	this.$element_.append($playButton);

  this.clock_.on("start", function () {
    $playButton.addClass(this.classNameActive_);
    $stopButton.removeClass(this.classNameActive_);
    //this.running_ = true;
  }.bind(this));

  //STOPBUTTON
	$stopButton = $("<button>").addClass(this.className_ + "-stop").append(synth.svgs.stop);
  $stopButton.addClass(this.classNameActive_);
	$stopButton.on("click", function () {
    if (this.clock_.started) {
		  this.clock_.stop();
    } else {
      this.clock_.interrupt();
    }
	}.bind(this));
	this.$element_.append($stopButton);

  this.clock_.on("stop", function () {
    $stopButton.addClass(this.classNameActive_);
    $playButton.removeClass(this.classNameActive_);
  }.bind(this));

  // KEYBOARD CONTROLS

  $(document).on("keydown", function (e) {
    if (e.which === 32) { //space
      // TOGLE PLAY/PAUSE
      if (!this.clock_.started) {
        this.clock_.start();
      } else {
        this.clock_.stop();
      }
      e.preventDefault();
    } else if (e.which === 27) { //esc
      this.clock_.interrupt();
    }
  }.bind(this));

  //BPM

	$bpmDiv = $("<div>").addClass(this.className_ + "-bpm");
  var bpmField = new synth.html.NumberInputFieldWithValueDrag({resolution: 0.7, displayPrecision: 2});
	bpmField.setValue(this.clock_.getBpM());

	bpmField.on("input", function () {
		this.clock_.setBpM(parseFloat(bpmField.getValue()));
	}.bind(this));

  this.clock_.on("tempoChange", function () {
    bpmField.setValue(this.clock_.getBpM());
  }.bind(this));

	$bpmDiv.append(bpmField.get$Element()).append("BpM");
	this.$element_.append($bpmDiv);
};
synth.inherits(synth.viewController.Playback, synth.viewController.ViewController);



synth.viewController.Sequencer = function (sequencer, rows, cols, opt_options) {

	this.sequencer_ = sequencer;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-sequencer";

	synth.viewController.ViewController.call(this, opt_options);


	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";

  var $buttonDiv = $("<div>").addClass(this.className_ + "-buttons");

	for (var i=0; i<rows; i++) { // rows
		for (var j=0; j<cols; j++) { // cols
			(function (row, col) {
				var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + j).addClass(this.classNameRow_ + "-" + i);
				$button.on("click", function () {
					var active = !$button.hasClass(this.classNameButtonActive_);
					$button.toggleClass(this.classNameButtonActive_);
					if (active) {
						this.sequencer_.addNote(col, rows-row-1);
					} else {
						this.sequencer_.removeNote(col, rows-row-1);
					}
				}.bind(this));
				$buttonDiv.append($button);
			}.bind(this))(i,j);
		}
	}

  this.$element_.append($buttonDiv);

  var $clearButton = $("<button>").addClass(this.className_ + "-clear").text("Clear").on("click", function () {
    this.sequencer_.clear();
    $buttonDiv.children().removeClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($clearButton);
};
synth.inherits(synth.viewController.Sequencer, synth.viewController.ViewController);





synth.html = synth.html || {};
synth.html.RotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  synth.Observable.call(this);
  this.registerEventType("change:value");
	this.spareDegrees = 90;
	this.resolution = 0.005;
	this.className_ = "rotary-control";
  this.classNameTitle_ = this.className_ + "-title";
	this.classNameSVG_ = this.className_ + "-svg";
	this.classNamePointer_ = this.className_ + "-pointer";
	this.classNameValueField_ = this.className_ + "-valuefield";
	this.$element_ = $("<div>").addClass(this.className_);
  if (opt_options.title) {
    this.$element_.append($("<div>").addClass(this.classNameTitle_).append(opt_options.title));
  }
	this.strokeWidth_ = 8;
	this.radius_ = 26;
	this.pointerLength_ = 25;
	this.pointerDistanceFromCenter_ = 12;
	this.dotRadius = 4;
	this.dotMinDistanceFromBorder_ = 2;
	this.$svg_ = $('<svg viewBox = "0 0 100 100" version = "1.1"></svg>').attr("class", this.classNameSVG_);
	this.$element_.append(this.$svg_);
	this.$svg_.html('<circle cx="50" cy="50" r="' + this.radius_ + '" stroke-width="' + this.strokeWidth_ + '" fill="transparent" />'
		+'<rect class="' + this.classNamePointer_ + '" width="' + this.strokeWidth_ + '" height="' + this.pointerLength_ + '" x="' + (50 - this.strokeWidth_/2) + '" y="' + (50 + this.pointerDistanceFromCenter_) + '"/>');
	var thisRef = this;
	this.$svg_.on("mousedown", function (e) {
		thisRef.onSVGMouseDown_(e);
	});
	this.$svg_.on("touchstart", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onSVGMouseDown_(e);
	});
	$(document).on("mousemove", function (e) {
		thisRef.onDocMouseMove_(e);
	});
	this.$svg_.on("touchmove", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onDocMouseMove_(e);
	});
	$(document).on("mouseup touchend", function (e) {
		thisRef.onDocMouseUp_(e);
	});
	this.$valueField_ = $('<input type="text" disabled>').addClass(this.classNameValueField_).addClass("synth-input-camouflage");
	this.$element_.append($("<div>").append(this.$valueField_));
	this.setPosition(0);
};
synth.inherits(synth.html.RotaryControl, synth.Observable);
synth.html.RotaryControl.prototype.get$Element = function () {
  return this.$element_;
};
synth.html.RotaryControl.prototype.createDots_ = function () {
	var alpha, x, y;
	for(var i=0; i<this.dots_.length; i++) {
		alpha = (this.spareDegrees/2 + (360-this.spareDegrees)*this.dots_[i]);
		x = -Math.sin(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		y = Math.cos(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		this.$svg_.html(this.$svg_.html() + '<circle cx="' + x +'" cy="' + y +'" r="' + this.dotRadius + '" />');
	}
};
synth.html.RotaryControl.prototype.onSVGMouseDown_ = function (e) {
	this.mouseMove_ = true;
	this.lastY_ = e.pageY;
	e.preventDefault();
};
synth.html.RotaryControl.prototype.onDocMouseMove_ = function (e) {
	if(this.mouseMove_) {
		var distance = this.lastY_ - e.pageY;
		var newValue = Math.max(0, Math.min(this.position_ + distance*this.resolution, 1));
		this.setPosition(newValue);
		this.lastY_ = e.pageY;
	}
};
synth.html.RotaryControl.prototype.onDocMouseUp_ = function (e) {
	this.mouseMove_ = false;
};
synth.html.RotaryControl.prototype.getValue = function () {
	return this.value_;
};
synth.html.RotaryControl.prototype.setValue = function (value) {
  var oldValue = this.value_;
  this.value_ = value;
  this.fireEvent("change:value", {oldValue: oldValue});
};
synth.html.RotaryControl.prototype.setPosition = function (position) {
  //var oldValue = this.position_;
  this.position_ = position;
  var transformString = "rotate(" + (this.spareDegrees/2 + (360-this.spareDegrees)*position)  + " 50 50)";
  this.$svg_.children("."+this.classNamePointer_).attr("transform", transformString);
  this.updateValueFromPosition();
};

//AnalogRotaryControl.prototype.setTransformFunctions = function (from, to) {
//	this.valueFromExternal_ = from
//	this.valueToExternal_ = to;
//};
/**
 * AnalogRotaryControl
 * @class
 *
 *
 */
synth.html.AnalogRotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  this.min_ = opt_options.min || 0;
  this.max_ = opt_options.max || 1;
  if (opt_options.hasOwnProperty("logarithmic") && opt_options.logarithmic) {
    this.mappingFunction_ = function (x) {
      return this.min_/Math.E * Math.exp(Math.log(this.max_*Math.E/this.min_)*x);
    };
    this.inverseMappingFunction_ = function (y) {
      return Math.log(y*Math.E/this.min_) / Math.log(this.max_*Math.E/this.min_);
    };
  } else {
    this.mappingFunction_ = function (x) {
      return this.min_ + x * (this.max_ - this.min_)
    };
    this.inverseMappingFunction_ = function (y) {
      return y / (this.max_ - this.min_) - this.min_;
    };
  }
	synth.html.RotaryControl.call(this, opt_options);
  this.dots_ = [0,1];
  this.createDots_();
  this.displayPrecision_ = opt_options.displayPrecision || 2;
  this.unit_ = opt_options.unit || "";
  this.setEditable(opt_options.editable || true);
  this.setValue(Math.min(this.max_, Math.max(this.min_, opt_options.initial || this.min_)));
  this.updatePositionFromValue();
};
synth.inherits(synth.html.AnalogRotaryControl, synth.html.RotaryControl);
synth.html.AnalogRotaryControl.prototype.setValue = function (value) {
  value = Math.min(this.max_, Math.max(this.min_, value));
  synth.html.RotaryControl.prototype.setValue.call(this, value);
  var displayValue = value.toFixed(this.displayPrecision_);
  if (this.unit_) {
    displayValue += " " + this.unit_;
  }
  this.$valueField_.val(displayValue);
};
synth.html.AnalogRotaryControl.prototype.setEditable = function (editable) {
  this.editable_ = editable;
  //var onFocus = function(e) {
		//this.$valueField_.removeClass("synth-input-camouflage");
	//}.bind(this);
	if (this.editable_) {
		this.$valueField_.attr("disabled", false);
		//this.$valueField_.on("focus", onFocus);
		this.$valueField_.on("blur", function(e) {
			//this.$valueField_.addClass("synth-input-camouflage");
      var input = parseFloat(this.$valueField_.val());
      if (!_.isNaN(input)) {
        this.setValue(input);
        this.updatePositionFromValue();
      }
	 	}.bind(this));
		this.$valueField_.on("keydown", function(e) {
			if(e.which === 13) { // enter
				this.$valueField_.blur();
			} else if (e.which === 27) { // escape
				this.updateValueFromPosition();
				this.$valueField_.blur();
			}
		}.bind(this));
	} else {
		this.$valueField_.attr("disabled", true);
		//this.$valueField_.off("focus", onFocus);
	}
};
synth.html.AnalogRotaryControl.prototype.updateValueFromPosition = function () {
  this.setValue(this.mappingFunction_(this.position_));
};
synth.html.AnalogRotaryControl.prototype.updatePositionFromValue = function () {
  this.setPosition(this.inverseMappingFunction_(this.value_));
};

/**
 * DiscreteRotaryControl
 * @class
 *
 *
 */
synth.html.DiscreteRotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  this.valueIndex_ = 0;
  synth.html.RotaryControl.call(this, opt_options);
  this.setValueArray(opt_options.values || [0, 1]);
  this.setValue(opt_options.initial || this.values_[0]);
  this.updatePositionFromValue();
};
synth.inherits(synth.html.DiscreteRotaryControl, synth.html.RotaryControl);
synth.html.DiscreteRotaryControl.prototype.setValueArray = function (valueArray) {
  this.length_ = valueArray.length;
  this.values_ = valueArray;
  this.dots_ = [];
  for(var i=0; i<this.length_; i++) {
    this.dots_.push(1/(this.length_-1)*i);
  }
  this.createDots_();
  this.updateValueFromPosition();
};
synth.html.DiscreteRotaryControl.prototype.updateValueFromPosition = function () {
  if (this.values_) {
    var findNearest = function (start, end) {
      if (end-start > 1) {
        var middle = start + Math.floor((end-start)/2);
        if (this.position_ <= this.dots_[middle]) {
          return findNearest(start, middle);
        } else {
          return findNearest(middle, end);
        }
      } else if (end-start === 1) {
        if (this.position_ - this.dots_[start] < this.dots_[end] - this.position_) {
          return start;
        } else {
          return end;
        }
      } else {
         return start;
      }
    }.bind(this);
    this.valueIndex_ = findNearest(0, this.length_-1);
    this.setValue(this.values_[this.valueIndex_]);
    this.$valueField_.val(this.getValue());
  }
};
synth.html.DiscreteRotaryControl.prototype.updatePositionFromValue = function () {
  this.valueIndex_ = this.values_.indexOf(this.getValue());
  this.setPosition(this.dots_[this.valueIndex_]);
};
synth.html.DiscreteRotaryControl.prototype.onDocMouseUp_ = function (e) {
  if (this.mouseMove_) {
    this.setPosition(this.dots_[this.valueIndex_]);
  }
  synth.html.RotaryControl.prototype.onDocMouseUp_.call(this, e);
};



synth.viewController.SoundGeneratorSimple = function (soundGenerator, opt_options) {

	this.soundGenerator_ = soundGenerator;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-soundgenerator-simple";

	synth.viewController.ViewController.call(this, opt_options);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: soundGenerator.getWaveType() });
  waveTypeControl.on("change:value", function () {
    this.soundGenerator_.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0, max: 2, initial: soundGenerator.getGain() });
  gainControl.on("change:value", function () {
    this.soundGenerator_.setGain(gainControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.SoundGeneratorSimple, synth.viewController.ViewController);






synth.viewController.SoundGenerator = function (soundGenerator, opt_options) {

	this.soundGenerator_ = soundGenerator;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.viewController.ViewController.call(this, opt_options);

  // wave form -> dropdown?

  var waveTypeControl = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: soundGenerator.getWaveType() });
  waveTypeControl.on("change:value", function () {
    this.soundGenerator_.setWaveType(waveTypeControl.getValue());
  }.bind(this));

  // gain

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0.01, max: 1, logarithmic: true, displayPrecision: 2, initial: soundGenerator.getGain() });
  gainControl.on("change:value", function () {
    this.soundGenerator_.setGain(gainControl.getValue());
  }.bind(this));

  // attack

  var attackControl = new synth.html.AnalogRotaryControl({ title: "Attack", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: soundGenerator.getAttack() });
  attackControl.on("change:value", function () {
    this.soundGenerator_.setAttack(attackControl.getValue());
  }.bind(this));

  // decay

  var decayControl = new synth.html.AnalogRotaryControl({ title: "Decay", min: 0.01, max: 10, logarithmic: true, displayPrecision: 2, unit: "s", initial: soundGenerator.getDecay() });
  decayControl.on("change:value", function () {
    this.soundGenerator_.setDecay(decayControl.getValue());
  }.bind(this));

  // sustain

  var sustainControl = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 2, initial: soundGenerator.getSustain() });
  sustainControl.on("change:value", function () {
    this.soundGenerator_.setSustain(sustainControl.getValue());
  }.bind(this));

  // release

  var releaseControl = new synth.html.AnalogRotaryControl({ title: "Release", min: 0.01, max: 20, logarithmic: true, displayPrecision: 3, unit: "s", initial: soundGenerator.getRelease() });
  releaseControl.on("change:value", function () {
    this.soundGenerator_.setRelease(releaseControl.getValue());
  }.bind(this));

  this.$element_.append(waveTypeControl.get$Element());
  this.$element_.append(gainControl.get$Element());
  this.$element_.append(attackControl.get$Element());
  this.$element_.append(decayControl.get$Element());
  this.$element_.append(sustainControl.get$Element());
  this.$element_.append(releaseControl.get$Element());

};
synth.inherits(synth.viewController.SoundGenerator, synth.viewController.ViewController);







// Amount

synth.viewController.PassFilter = function (passFilter, opt_options) {

	this.passFilter_ = passFilter;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-passfilter";

	synth.viewController.ViewController.call(this, opt_options);

  // type

  var typeControl = new synth.html.DiscreteRotaryControl({ title: "Type", values: ["lowpass", "highpass", "bandpass"], initial: passFilter.getType() });
  typeControl.on("change:value", function() {
    this.passFilter_.setType(typeControl.getValue());
  }.bind(this));

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Freq", min: 100, max: 1000, logarithmic: true, displayPrecision: 0, initial: passFilter.getFrequency() });
  freqControl.on("change:value", function () {
    this.passFilter_.setFrequency(freqControl.getValue());
  }.bind(this));

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0.01, max: 10, logarithmic: true, displayPrecision: 0, initial: passFilter.getResonance() });
  resoControl.on("change:value", function () {
    this.passFilter_.setResonance(resoControl.getValue());
  }.bind(this));

  // Amount

  var amountControl = new synth.html.AnalogRotaryControl({ title: "Amount", min: 0, max: 1, initial: this.passFilter_.getAmount() });
  amountControl.on("change:value", function () {
    this.passFilter_.setAmount(amountControl.getValue());
  }.bind(this));

  this.$element_.append(typeControl.get$Element());
  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
  this.$element_.append(amountControl.get$Element());
};
synth.inherits(synth.viewController.PassFilter, synth.viewController.ViewController);






synth.viewController.Gain = function (gainModule, opt_options) {

	this.gainModule_ = gainModule;

	opt_options = opt_options || {};
	this.className_ = opt_options.className || "synth-module-gain";

	synth.viewController.ViewController.call(this, opt_options);

  // frequency

  var gainControl = new synth.html.AnalogRotaryControl({ title: "Vol", min: 0.1, max: 1, logarithmic: true, initial: gainModule.getGain() });
  gainControl.on("change:value", function () {
    this.gainModule_.setGain(gainControl.getValue());
  }.bind(this));


  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.viewController.Gain, synth.viewController.ViewController);




synth.scales = {};

(function () {

  // i calculate frequencies from note c0 to b8
  // the given index and frequency specifies the frequency of the specified note, all others are caluculated accordingly
  var calculateFrequencies = function (index, frequency) {

    var frequencies = [];
    var number = 12 * 9;
    var a = Math.pow(2, 1/12);

    for (var i=0; i<number; i++) {
      frequencies.push(frequency*Math.pow(a, i-index));
    }

    return frequencies;
  };

  synth.scales.getIndexOf = function (step, intervals, baseNoteIndex) {
    var octaveLength = intervals.reduce( function (prev, cur) { return prev+cur; } );
    var octaveModifier = Math.floor(step/octaveLength);
    return intervals.slice(0, step % intervals.length).reduce( function (prev, cur) { return prev+cur; }, baseNoteIndex + octaveModifier * octaveLength );
  };

  synth.scales.intervals = {};
  synth.scales.intervals.major = [2,2,1,2,2,2,1];
  synth.scales.intervals.minor = [2,1,2,2,1,2,2];
  synth.scales.intervals.minorGypsy = [2,1,3,2,1,3,1];
  synth.scales.intervals.majorGypsy = [1,3,1,2,1,3,2];
  synth.scales.intervals.bluesMinor = [3,2,1,1,3,2];
  synth.scales.intervals.bluesMajor = [2,1,1,3,2,1,2];
  //synth.scales.intervals.rockNRoll = [2,1,1,1,1,1,2,1,2];

  synth.scales.frequencyTables = {}
  synth.scales.frequencyTables.a4is432Hz = calculateFrequencies( 57, 432 );
  synth.scales.frequencyTables.a4is434Hz = calculateFrequencies( 57, 434 );
  synth.scales.frequencyTables.a4is436Hz = calculateFrequencies( 57, 436 );
  synth.scales.frequencyTables.a4is437Hz = calculateFrequencies( 57, 438 );
  synth.scales.frequencyTables.a4is440Hz = calculateFrequencies( 57, 440 );
  synth.scales.frequencyTables.a4is442Hz = calculateFrequencies( 57, 442 );
  synth.scales.frequencyTables.a4is444Hz = calculateFrequencies( 57, 444 );
  synth.scales.frequencyTables.a4is446Hz = calculateFrequencies( 57, 446 );

})();





/**
 * This class provides a timing event named nextBar, which is listened to by playing objects of the project to know when the next notes should be played and in which tempo they should be played.
 * @class
 * @params audioContext {audioContext} the audioContext
 * @fires nextBar
 * @fires start
 * @fires stop
 * @fires tempoChange
 */

// NOTE: Global Assumption: BpM is the Velocity of Quarters

synth.Clock = function (audioContext) {
	synth.Observable.call(this);

	this.registerEventType("nextBar");
	this.registerEventType("start");
	this.registerEventType("stop");
	this.registerEventType("tempoChange");
  this.registerEventType("interrupt");

	this.audioContext_ = audioContext;

	this.bpm_ = 120;

	this.minBpm_ = 20;
	this.maxBpm_ = 360;

	this.lookahead_ = 0.5; // the time between the nextBar event and the actual time of the nextBar

	/**
	 * @property started {boolean} whether the clock is started or not
	 */
	this.started = false;

	this.nextBar_ = 0;
	this.nextBarTime_ = 0;

};
synth.inherits(synth.Clock, synth.StateExchange);
synth.inherits(synth.Clock, synth.Observable);

/**
 * Gives the BpM of the clock
 * NOTE: not whenable
 * @method
 * @returns bpm {float} the BpM (Beats per Minute) of the clock. It is assumed that every bar is 4/4
 */
synth.Clock.prototype.getBpM = function () {
	return this.bpm_;
};

/**
 * Changes the tempo of the clock
 * NOTE: not whenable
 * @method
 * @param bpm {float} the BpM (Beats per Minute) of the clock. It is assumed that every bar is 4/4
 */
synth.Clock.prototype.setBpM = function (bpm) {

  if (bpm !== this.bpm_) {
    var oldBpM = this.bpm_;
    var oldBarLength = this.getBarLength();

    this.bpm_ = Math.min(this.maxBpm_, Math.max(this.minBpm_, bpm));

    if (this.started) {

      var barTimeBeforeTimeChange = this.nextBarTime_ - oldBarLength;

      var oldTempoPart = (this.audioContext_.currentTime - barTimeBeforeTimeChange) / oldBarLength;
      var newTempoPart = 1 - oldTempoPart;

      // console.log("when: %f timeBefore: %f oldBarLength: %f newBarLength: %f oldNextBar: %f newNextBar: %f now: %f",
        // when, barTimeBeforeTimeChange, oldBarLength, this.getBarLength(), this.nextBarTime_, when + (1 - oldTempoPart) * this.getBarLength(), this.audioContext_.currentTime);

      this.nextBarTime_ = this.audioContext_.currentTime + (1 - oldTempoPart) * this.getBarLength();
      this.makeLoop_();
    }

    /**
     * tempoChange Event
     * @event tempoChange
     * @property multiplier {float} a multiplier to get from the old to the new tempo
     */
    this.fireEvent("tempoChange", [oldBpM/bpm]);
  }
};

/**
 * NOTE: not whenable
 * @method
 * @returns barLength {float} The length of a bar in seconds
 */
synth.Clock.prototype.getBarLength = function () {
	return 60 / this.bpm_ * 4;
};

/**
 * Starts the clock at specified time or now
 * @method
 * @param when {float} time to start the clock
 */
synth.Clock.prototype.start = function (when) {

	when = when || this.audioContext_.currentTime;

	/**
	 * start Event
	 * @event start
	 * @property when {float} the time the clock starts
	 */
	this.fireEvent("start", [when]);

	/**
	 * nextBar Event - see below
	 */
	this.fireEvent("nextBar", [ 0, when ] );

	this.nextBar_ = 1;
	this.nextBarTime_ = when + this.getBarLength();
	this.makeLoop_(when);

	this.started = true;
};

/**
 * Stops the clock at specified time or now
 * @param when {float} time to stop the clock
 * @method
 */
synth.Clock.prototype.stop = function (when) {
	setTimeout(function () {
		this.started = false;

		clearTimeout(this.loopTimeout);

		/**
		 * stop Event
		 * @event stop
		 * @property when {float} the time the clock stops
		 */
		this.fireEvent("stop", [when]);
	}.bind(this), (when - this.audioContext_.currentTime) * 1000)
};

/**
 * Stops the clock and sends an interrupt signal immediately
 * @method
 */
synth.Clock.prototype.interrupt = function () {
		this.stop(this.audioContext_.currentTime);
		/**
		 * interrupt Event
		 * @event interrupt
		 */
		this.fireEvent("interrupt");
};

/**
 * This method creates a self adjusting loop which fires the nextBar event
 * @private
 * @method
 */
synth.Clock.prototype.makeLoop_ = function () {
	clearTimeout(this.loopTimeout);

	var loop = function () {
		/**
		 * nextBar Event
		 * @event nextBar
		 * @property barNumber {int} which bar it is
		 * @property when {float} at which time this bar starts
		 */
		this.fireEvent("nextBar", [this.nextBar_, this.nextBarTime_]);

		this.nextBar_++;
		this.nextBarTime_ += this.getBarLength();
		this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.lookahead_) * 1000);
	}.bind(this);

	this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.lookahead_) * 1000);
};

synth.Clock.prototype.currentTime = function () {
  return this.audioContext_.currentTime;
};






/**
 * Helpers
 */

var helpers = helpers || {};

helpers.timeObjectsEqual = function (tO1, tO2) {
  return tO1.time === tO2.time && tO1.duration === tO2.duration && tO1.value === tO2.value;
};

/**
 * This is a class which stores a collection of timed objects. Each timeObject must have a time, a duration, a value (comparable), they are identified by all this three parameters combined and can have any additional data.
 * It provides many helper methods.
 * It is chainable.
 * @class
 * @fires insert
 * @fires remove
 * @fires objectChanged
 */

synth.TimeCollection = function (begin, end, options) {
	synth.Observable.call(this);

	options = options || {};

	this.timeObjects_ = [];
	this.count = 0;

	if (_.isNaN(begin) || _.isNaN(end)) {
		throw new Error("TimeCollection needs a begin and an end!"); // NOTE: really?
	}
	this.begin = begin;
	this.end = end;

	//this.lines_ = false;
	//this.flat_ = false;

	this.registerEventType("insert");
	this.registerEventType("remove");
	this.registerEventType("objectChanged");
	//this.registerEventType("object:change");
};
synth.inherits(synth.TimeCollection, synth.Observable);

/**
 * Inserts a timeObject
 * @param timeObject {object}
 * @method
 */
synth.TimeCollection.prototype.insert = function (timeObject) {
	this.timeObjects_.push(timeObject);
	this.count++;

	/**
	 * Insert Event
	 * @event insert
	 * @property timeObject {object} the inserted timeObject
	 */
	this.fireEvent("insert", [timeObject]);

	return this;
};

/**
 * Removes the first occurance of timeObject
 * @param timeObject {object}
 * @method
 */
 synth.TimeCollection.prototype.remove = function (timeObject) {
	for(var i=0, found=false; i<this.count && !found; i++) {
		if(helpers.timeObjectsEqual(this.timeObjects_[i], timeObject)) {
			this.timeObjects_.splice(i, 1);
			found = true;
			this.count--;

			/**
			 * Remove Event
			 * @event remove
			 * @property timeObject {object} the removed timeObject
			 */
			this.fireEvent("remove", [timeObject]);
		}
	}

	return this; // return found
};

/**
 * Takes a function which is executed for every timeObject inside this collection.
 * @param callback {function}
 * @method
 */
synth.TimeCollection.prototype.forEach = function (callback) {
	this.timeObjects_.forEach(callback);
};

/**
 * Returns a new collection containing all objects before the given time. If overlapping is set to true it also contains objects which start, but don't end before the given time.
 * @method
 * @param when {float} time
 * @param overlapping {boolean}
 */
synth.TimeCollection.prototype.before = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(this.begin, when);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time + this.timeObjects_[i].duration < when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if( overlapping && this.timeObjects_[i].time < when ) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}

	return newTimeCollection;
};


/**
 * Returns a new collection containing all objects before or equal the given time. If overlapping is set to true it also contains objects which start, but don't end before or equal the given time.
 * @method
 * @param when {float} time
 * @param overlapping {boolean}
 */
synth.TimeCollection.prototype.beforeEqual = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(this.begin, when);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time + this.timeObjects_[i].duration <= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if( overlapping && this.timeObjects_[i].time <= when ) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}

	return newTimeCollection;
};


/**
 * Returns a new collection containing all objects after the given time. If overlapping is set to true it also contains objects which start, but don't end after the given time.
 * @method
 * @param when {float} time
 * @param overlapping {boolean}
 */
synth.TimeCollection.prototype.after = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(when, this.end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time > when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if (overlapping && this.timeObjects_[i].time + this.timeObjects_[i].duration > when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}

	return newTimeCollection;
};

/**
 * Returns a new collection containing all objects after or equal the given time. If overlapping is set to true it also contains objects which start, but don't end after or equal the given time.
 * @method
 * @param when {float} time
 * @param overlapping {boolean}
 */
synth.TimeCollection.prototype.afterEqual = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(when, this.end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time >= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if (overlapping && this.timeObjects_[i].time + this.timeObjects_[i].duration >= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}

	return newTimeCollection;
};

// synth.TimeCollection.prototype.merge = function (anotherTimeCollection) {
	// var newTimeCollection = new synth.TimeCollection(Math.min(this.begin, anotherTimeCollection.begin), Math.max(this.end, anotherTimeCollection.end));

	// this.forEach( function (timeObject) {
		// newTimeCollection.insert(_.cloneDeep(timeObject));
	// } );

	// anotherTimeCollection.forEach(function (timeObject) {
		// newTimeCollection.insert(_.cloneDeep(timeObject));
	// } );

	// return newTimeCollection;
// };


/**
 * Clones a timeCollection and all containing timeObjects
 * @method
 */
synth.TimeCollection.prototype.clone = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		newTimeCollection.insert(_.cloneDeep(timeObject));
	});
	return newTimeCollection;
};


// synth.TimeCollection.prototype.clear = function () {
	// for (var i=0, ii=this.count; i<ii; i++) {
		// this.count--;
		// this.fireEvent("remove", [this.timeObjects_.shift()]);
	// };
	// return this;
// };


/**
 * Adds a given time to all times of the timeObjects
 * @method
 */
synth.TimeCollection.prototype.timeAdd = function (time) {
	this.begin += time;
	this.end += time;
	//var newTimeCollection = this.clone();
	this.forEach(function (timeObject) {
    var old = _.cloneDeep(timeObject);
		timeObject.time += time;
		/**
		 * Object changed Event
		 * @event objectChanged
     * @type {object}
		 * @property old {object} a copy of the old object
     * @property new {object} the new object
		 */
    this.fireEvent("objectChanged", [{old: old, new: timeObject}]);
	}.bind(this));
	return this;
};


/**
 * Multiply a given value to all times of the timeObjects
 * @method
 */
synth.TimeCollection.prototype.timeMultiply = function (value) {
	this.begin *= value;
	this.end *= value;
	this.forEach(function (timeObject) {
		timeObject.time *= value;
		/**
		 * Object changed Event
		 * @event objectChanged
		 * @property timeObject {object} the changed object
		 */
		this.fireEvent("objectChanged", [timeObject]);
	}.bind(this));
	return this;
};

/**
 * Sorts the collection by time
 * @method
 */
synth.TimeCollection.prototype.sort = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	_.sortBy(this.timeObjects_, 'time').forEach(function (timeObject) {
		newTimeCollection.insert(timeObject);
	});
	return newTimeCollection;
};

/**
 * Returns a new collection containing all time Objects which are at this time
 * @method
 */
synth.TimeCollection.prototype.atTime = function (time) {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		if(timeObject.time <= time && timeObject.time + timeObject.duration >= time) {
			newTimeCollection.insert(timeObject);
		}
	});

	return newTimeCollection;
};

/**
 * Returns true if the collection contains the timeObject
 * @method
 */
synth.TimeCollection.prototype.contains = function (checkTimeObject) {
	var found = false;
	this.forEach(function (timeObject) {
		if (timeObject.time === checkTimeObject.time && timeObject.duration === checkTimeObject.duration && timeObject.value === checkTimeObject.value) {
      found = true;
    }
	});

	return found;
};

synth.debuggers = {};
synth.debuggers.debugCollection = function (collection) {
  var $debugTable = $("<table>");
  var $rows = $();
  $("body").append($debugTable);
  $debugTable.append($("<thead>").append($("<tr>").append($("<th>").text("Time")).append($("<th>").text("Duration")).append($("<th>").text("Value"))));
  $debugTable.append("<tbody>");
  var loop = function () {
    $debugTable.children("tbody").empty();
    collection.sort().forEach(function (timeObject) {
      $row = $("<tr>").append($("<td>").append(timeObject.time)).append($("<td>").append(timeObject.duration)).append($("<td>").append(timeObject.value));
      $debugTable.children("tbody").append($row);
    });
  };
  var interval = setInterval(loop, 50);
  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};
synth.debuggers.debugTime = function (audioContext) {
  $showTime = $("<span>");
  $("body").append($("<div>").append("currentTime: ").append($showTime));
  var loop = function () {
    $showTime.text(audioContext.currentTime);
  };
  var interval = setInterval(loop, 50);
  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};


})();
