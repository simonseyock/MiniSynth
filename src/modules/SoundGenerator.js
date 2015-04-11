// #ifndef __SOUNDEGENERATORMODULE__
// #define __SOUNDEGENERATORMODULE__

// #include "Module.js"

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

// #endif
