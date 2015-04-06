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
  synth.inherits(SingleSoundGenerator, synth.instrument.module.Module);

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

      this.started_ = true;
    }
  };

  SingleSoundGenerator.prototype.shapeEnvelope_ = function () {

    var currentTime = this.audioContext_.currentTime;
    var nominalEndTime = this.timeObject.time + this.timeObject.duration;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    var attackCanFinish = true;
    var decayCanFinish = true;

    if (currentTime <= nominalEndTime + this.envelope_.release) {
      if (currentTime <= nominalEndTime) {
        if (currentTime <= this.startTime_ + this.envelope_.attack + this.envelope_.decay) {
          if (currentTime <= this.startTime_ + this.envelope_.attack) {
            if (currentTime <= this.startTime_) {
              // Note start
              this.envelopeShaper_.gain.setValueAtTime(0, this.startTime_);
            }

            // Attack
            // is the note longer than the attack time?
            if (this.startTime_ + this.envelope_.attack <= nominalEndTime) {
              this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.startTime_ + this.envelope_.attack);
              attackCanFinish = true;
            } else {
              var part = (nominalEndTime - this.startTime_) / this.envelope_.attack;
              this.envelopeShaper_.gain.linearRampToValueAtTime(part, nominalEndTime);
              attackCanFinish = false;
            }
          }

          // Decay
          // is note longer than attack time plus decay time?
          if (this.startTime_ + this.envelope_.attack + this.envelope_.decay <= nominalEndTime) {
            this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope_.sustain, this.startTime_ + this.envelope_.attack + this.envelope_.decay);
            decayCanFinish = true;
          } else if (attackCanFinish) {
            var part = (nominalEndTime - this.startTime_ - this.envelope_.attack) / this.envelope_.decay;
            this.envelopeShaper_.gain.linearRampToValueAtTime(part * this.envelope_.sustain, this.startTime_ + this.envelope_.attack + this.envelope_.decay);
            decayCanFinish = false;
          }
        }

        if (decayCanFinish) {
          this.envelopeShaper_.gain.setValueAtTime(this.envelope_.sustain, nominalEndTime);
        }
      }

      this.envelopeShaper_.gain.linearRampToValueAtTime(0, nominalEndTime + this.envelope_.release);
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
      }
    }

    this.shapeEnvelope_();
  };

  SingleSoundGenerator.prototype.isFinished = function () {
    return this.audioContext_.currentTime > this.realEndTime;
  };


  SingleSoundGenerator.prototype.setWaveType = function (waveType) {
    this.waveType_ = waveType;
    this.oscillator_.type = waveType;
  };

  SingleSoundGenerator.prototype.dispose = function () {
    if(this.started_) {
      this.oscillator_.stop(0);
    }
    this.oscillator_.disconnect();
    this.oscillator_ = null;

    this.envelopeShaper_.gain.cancelScheduledValues(0);
    this.envelopeShaper_.disconnect();
    this.envelopeShaper_ = null;

    this.output = null;
  };



  synth.instrument.module.SoundGenerator = function (audioContext, opt_options) {
    this.audioContext_ = audioContext;

    opt_options = opt_options || {};

    this.gain_ = audioContext.createGain();

    this.waveType_ = opt_options.waveType || "sine";

    //this.voices_ = 8;

    //this.voiceCollections_ = [];

    this.singleSoundGenerators_ = [];

    this.envelope_ = opt_options.envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };

    this.output = this.gain_;
  };
  synth.inherits(synth.instrument.module.SoundGenerator, synth.instrument.module.Module);

  synth.instrument.module.SoundGenerator.prototype.watch = function (collection) {
    var cleanUp = function () {
      for(var i=this.singleSoundGenerators_.length-1; i >= 0; i--) {
        if(this.singleSoundGenerators_[i].isFinished()) {
          this.singleSoundGenerators_[i].dispose();
          this.singleSoundGenerators_.splice(i,1);
        }
      }
    }.bind(this);

    collection.on("insert", function (timeObject) {
      cleanUp();
      var sSG = new SingleSoundGenerator(this.audioContext_, timeObject, this.waveType_, this.envelope_);
      this.singleSoundGenerators_.push(sSG);
      sSG.connect(this.gain_);
    }.bind(this));

    collection.on("remove", function (timeObject) {
      for(var i=this.singleSoundGenerators_.length-1, found=false; i >= 0 && !found; i--) {
        if(helpers.timeObjectsEqual(this.singleSoundGenerators_[i].timeObject, timeObject)) {
          found = true;
          this.singleSoundGenerators_[i].dispose();
          this.singleSoundGenerators_.splice(i,1);
        }
      };
    }.bind(this));
  };

  synth.instrument.module.SoundGenerator.prototype.pause = function (when) {
    // pause doesn't support continuation at the moment
    when = when || 0;
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.dispose();
    });
    this.singleSoundGenerators_ = [];
  };

  synth.instrument.module.SoundGenerator.prototype.getWaveType = function () {
    return this.waveType_;
  };

  synth.instrument.module.SoundGenerator.prototype.setWaveType = function (waveType) {
    this.waveType_ = waveType;
    this.singleSoundGenerators_.forEach(function (sSG) {
       sSG.setWaveType(waveType);
    });
  };

  synth.instrument.module.SoundGenerator.prototype.getGain = function () {
    return this.gain_.gain.value;
  };

  synth.instrument.module.SoundGenerator.prototype.setGain = function (gain) {
    this.gain_.gain.value = gain;
  };

  synth.instrument.module.SoundGenerator.prototype.updateTiming = function () {
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.updateTiming();
    });
  };

  synth.instrument.module.SoundGenerator.prototype.getAttack = function () {
    return this.envelope_.attack;
  };

  synth.instrument.module.SoundGenerator.prototype.setAttack = function (attack) {
    this.envelope_.attack = attack;
    this.updateTiming();
  };

  synth.instrument.module.SoundGenerator.prototype.getDecay = function () {
    return this.envelope_.decay;
  };

  synth.instrument.module.SoundGenerator.prototype.setDecay = function (decay) {
    this.envelope_.decay = decay;
    this.updateTiming();
  };

  synth.instrument.module.SoundGenerator.prototype.getSustain = function () {
    return this.envelope_.sustain;
  };

  synth.instrument.module.SoundGenerator.prototype.setSustain = function (sustain) {
    this.envelope_.sustain = sustain;
    this.updateTiming();
  };

  synth.instrument.module.SoundGenerator.prototype.getRelease = function () {
    return this.envelope_.release;
  };

  synth.instrument.module.SoundGenerator.prototype.setRelease = function (release) {
    this.envelope_.release = release;
    this.updateTiming();
  };

})();

// #endif
