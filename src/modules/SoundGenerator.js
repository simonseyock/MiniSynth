// #ifndef __SOUNDEGENERATORMODULE__
// #define __SOUNDEGENERATORMODULE__

// #include "Module.js"

(function () {

  /*
   * The module Soundgenerator can produce sounds in different frequencies, wavetypes, lengths and with a defined envelope shape.
   * The tempo can be changed after notes where send to play.
   * To achieve this the Soundgenerator creates a SingleSoundGenerator for every sound it plays.
   * If the tempo, the wavetype or the envelope shape gets changed every SingleSoundGenerator gets updated
   */

  synth.module.SoundGenerator = function (audioContext, opt_options) {
    synth.module.Module.call(this, audioContext);

    opt_options = opt_options || {};
    opt_options.envelope = opt_options.envelope || {};

    this.gain_ = audioContext.createGain();

    this.singleSoundGenerators_ = [];

    this.output = this.gain_;

    this.set("waveType", opt_options.waveType || "sine");
    this.set("gain", opt_options.gain || 1);
    this.set("attack", opt_options.envelope.attack || 0);
    this.set("decay", opt_options.envelope.decay || 0);
    this.set("sustain", opt_options.envelope.sustain || 1);
    this.set("release", opt_options.envelope.release || 0);

    this.on("change:waveType", this.onWaveTypeChange);
    this.on("change:gain", this.onGainChange);
    this.on("change:attack", this.updateTiming);
    this.on("change:decay", this.updateTiming);
    this.on("change:sustain", this.updateTiming);
    this.on("change:release", this.updateTiming);
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

  synth.module.SoundGenerator.prototype.listen = function (collection) {

    collection.on("insert", function (timeObject) {
      this.disposeFinishedSingleSoundGenerators_();
      var sSG = new SingleSoundGenerator(this.audioContext_, timeObject, this.get("waveType"), {
        attack: this.get("attack"),
        decay: this.get("decay"),
        sustain: this.get("sustain"),
        release: this.get("release")
      });
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

  synth.module.SoundGenerator.prototype.onWaveTypeChange = function (e) {
    this.disposeFinishedSingleSoundGenerators_();
    this.singleSoundGenerators_.forEach(function (sSG) {
       sSG.setWaveType(e.newValue);
    });
  };

  synth.module.SoundGenerator.prototype.onGainChange = function (e) {
    this.gain_.gain.value = e.newValue;
  };

  synth.module.SoundGenerator.prototype.updateTiming = function () {
    this.disposeFinishedSingleSoundGenerators_();
    this.singleSoundGenerators_.forEach(function (sSG) {
      sSG.envelope = {
        attack: this.get("attack"),
        decay: this.get("decay"),
        sustain: this.get("sustain"),
        release: this.get("release")
      };
      sSG.updateTiming();
    }.bind(this));
  };

  synth.module.SoundGenerator.prototype.getState = function () {
    var state = synth.module.Module.prototype.getState.call(this);
    state.waveType = this.get("waveType");
    state.gain = this.get("gain");
    state.attack = this.get("attack");
    state.decay = this.get("decay");
    state.sustain = this.get("sustain");
    state.release = this.get("release");
    return state;
  };

  synth.module.SoundGenerator.prototype.setState = function (state) {
    synth.module.Module.prototype.setState.call(this, state);
    this.set("waveType", state.waveType);
    this.set("gain", state.gain);
    this.set("attack", state.attack);
    this.set("decay", state.decay);
    this.set("sustain", state.sustain);
    this.set("release", state.release);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var SingleSoundGenerator = function (audioContext, timeObject, waveType, envelope) {
    this.audioContext_ = audioContext;

    this.waveType_ = waveType || "sine";
    this.timeObject = timeObject;
    this.envelope = envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };
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

      this.realEndTime_ = this.timeObject.time + this.timeObject.duration + this.envelope.release;

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

    if (currentTime <= nominalEndTime + this.envelope.release) {
      if (currentTime <= nominalEndTime) {
        if (currentTime <= this.startTime_ + this.envelope.attack + this.envelope.decay) {
          if (currentTime <= this.startTime_ + this.envelope.attack) {
            if (currentTime <= this.startTime_) {
              // Note start
              this.envelopeShaper_.gain.setValueAtTime(0, this.startTime_);
              //console.log("0 at %s", this.startTime_); //DEBUG
            }

            // Attack
            // is the note longer than the attack time?
            if (this.startTime_ + this.envelope.attack <= nominalEndTime) {
              this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.startTime_ + this.envelope.attack);
              //console.log("linear Ramp to %s at %s", 1, this.startTime_ + this.envelope.attack); //DEBUG
              attackCanFinish = true;
            } else {
              var part = (nominalEndTime - this.startTime_) / this.envelope.attack;
              this.envelopeShaper_.gain.linearRampToValueAtTime(part, nominalEndTime);
              //console.log("linear Ramp to %s at %s", part, this.startTime_ + this.envelope.attack); //DEBUG
              attackCanFinish = false;
            }
          }

          // Decay
          // is note longer than attack time plus decay time?
          if (attackCanFinish) {
            if (this.startTime_ + this.envelope.attack + this.envelope.decay <= nominalEndTime) {
              this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay);
              //console.log("linear Ramp to %s at %s", this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay); //DEBUG
              decayCanFinish = true;
            } else {
              var part = (nominalEndTime - this.startTime_ - this.envelope.attack) / this.envelope.decay;
              this.envelopeShaper_.gain.linearRampToValueAtTime(part * this.envelope.sustain, nominalEndTime);
              //console.log("linear Ramp to %s at %s", part * this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay); //DEBUG
              decayCanFinish = false;
            }
          }
        }

        // Sustain
        if (attackCanFinish && decayCanFinish) {
          this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, nominalEndTime);
          //console.log("%s at %s", this.envelope.sustain, nominalEndTime); //DEBUG
        }
      }

      // Release
      this.envelopeShaper_.gain.linearRampToValueAtTime(0, nominalEndTime + this.envelope.release);
      //console.log("linear Ramp to %s at %s", 0, nominalEndTime + this.envelope.release); //DEBUG
    }

  };

  SingleSoundGenerator.prototype.updateTiming = function () {
    this.startTime_ = this.timeObject.time;
    this.realEndTime_ = this.timeObject.time + this.timeObject.duration + this.envelope.release;

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
    console.log(waveType);
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
        this.oscillator_.stop(this.audioContext_.currentTime + this.envelope.release);
        this.envelopeShaper_.gain.cancelScheduledValues(this.audioContext_.currentTime);
        this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.audioContext_.currentTime + this.envelope.release);
      }

      setTimeout(stopNow, this.envelope.release * 1000);
    }
  };

})();

// #endif
