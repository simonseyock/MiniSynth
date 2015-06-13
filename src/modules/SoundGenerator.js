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

  var SoundState = {
    PLANNED: 0,
    RUNNING: 1,
    FINISHED: 2
    //STARTED: 1,
    //SUSTAINED: 2,
    //ENDING: 3,
    //ENDED: 4
  };

  synth.module.SoundGenerator = function (audioContext, opt_options) {
    synth.module.Module.call(this, audioContext);

    opt_options = opt_options || {};
    opt_options.envelope = opt_options.envelope || {};

    this.gain_ = audioContext.createGain();

    this.sounds_ = [];

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

  synth.module.SoundGenerator.prototype.disposeEndedSounds_ = function () {
    for(var i=this.sounds_.length-1; i >= 0; i--) {
      if(this.sounds_[i].getSoundState() >= SoundState.FINISHED) {
        this.sounds_.splice(i,1)[0].dispose();
      }
    }
  };

  synth.module.SoundGenerator.prototype.listen = function (collection) {

    collection.on("insert", function (timeObject) {
      console.log("new sound at %s", timeObject.time);
      var newSound = new Sound(
        this.audioContext_,
        timeObject,
        this.get("waveType"),
        {
          attack: this.get("attack"),
          decay: this.get("decay"),
          sustain: this.get("sustain"),
          release: this.get("release")
        });
      this.sounds_.push(newSound);
      newSound.connect(this.gain_);
      this.disposeEndedSounds_();
    }.bind(this));

    collection.on("remove", function (timeObject) {
      for(var i=this.sounds_.length-1, found=false; i >= 0 && !found; i--) {
        if(helpers.timeObjectsEqual(this.sounds_[i].timeObject, timeObject)) {
          found = true;
          var sound = this.sounds_[i];
          if (sound.getSoundState() <= SoundState.PLANNED) {
            this.sounds_.splice(i, 1);
            sound.interrupt();
          }
        }
      }
      this.disposeEndedSounds_();
    }.bind(this));
  };

  synth.module.SoundGenerator.prototype.pause = function (when) {
    // pause doesn't support continuation at the moment
    when = when || 0;
    this.sounds_.forEach(function (sound) {
      if (sound.getSoundState() <= SoundState.PLANNED) {
        sound.interrupt();
      }
    });
    this.disposeEndedSounds_();
  };

  synth.module.SoundGenerator.prototype.interrupt = function () {
    this.sounds_.forEach(function (sound) {
      sound.interrupt();
      sound.dispose();
    });
    this.sounds_ = [];
  };

  synth.module.SoundGenerator.prototype.onWaveTypeChange = function (e) {
    this.disposeEndedSounds_();
    this.sounds_.forEach(function (sound) {
       sound.setWaveType(e.newValue);
    });
  };

  synth.module.SoundGenerator.prototype.onGainChange = function (e) {
    this.gain_.gain.value = e.newValue;
  };

  synth.module.SoundGenerator.prototype.updateTiming = function () {
    this.sounds_.forEach(function (sound) {
      if (sound.getSoundState() <= SoundState.PLANNED) {
        sound.envelope = {
          attack: this.get("attack"),
          decay: this.get("decay"),
          sustain: this.get("sustain"),
          release: this.get("release")
        };
        sound.shape();
      }
    }.bind(this));
    this.disposeEndedSounds_();
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

  var Sound = function (audioContext, timeObject, waveType, envelope) {
    this.audioContext_ = audioContext;

    this.timeObject = timeObject;
    this.envelope = envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };

    this.envelopeShaper_ = audioContext.createGain();
    this.envelopeShaper_.gain.value = 0;

    this.oscillator_ = this.audioContext_.createOscillator();
    this.oscillator_.frequency.value = this.timeObject.value;
    this.oscillator_.type = waveType || "sine";
    this.oscillator_.start(0);

    this.oscillator_.connect(this.envelopeShaper_);
    this.shape();

    //envelope (implemented with a gain node)

    this.output = this.envelopeShaper_;
  };
  synth.inherits(Sound, synth.module.Module);

  Sound.prototype.shape = function () {
    var currentTime = this.audioContext_.currentTime;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    this.attackTime_ = this.timeObject.time;
    this.decayTime_ = this.attackTime_ + this.envelope.attack;
    this.sustainTime_ = this.decayTime_ + this.envelope.decay;
    this.releaseTime_ = this.timeObject.time + this.timeObject.duration;


    if (this.envelope.attack === 0) {
      this.envelopeShaper_.gain.setValueAtTime(1, this.attackTime_);
    } else {
      this.envelopeShaper_.gain.setValueAtTime(0, this.attackTime_);

      if (this.envelope.attack < this.timeObject.duration) {
        this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.decayTime_);

        if (this.envelope.decay !== 0) {
          if (this.envelope.attack + this.envelope.decay < this.timeObject.duration) {
            this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain, this.sustainTime_);

            this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.releaseTime_);

          } else {
            var part = this.envelope.decay / (this.timeObject.duration - this.envelope.attack);
            this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain * part, this.releaseTime_);
          }
        } else {
          this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.decayTime_);
          this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.releaseTime_);
        }

      } else {
        var part = this.envelope.attack / this.timeObject.duration;
        this.envelopeShaper_.gain.linearRampToValueAtTime(part, this.releaseTime_);
      }
    }

    this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.releaseTime_ + this.envelope.release);
  };

/*  Sound.prototype.start = function () {

    var currentTime = this.audioContext_.currentTime;
    var nominalEndTime = this.timeObject.time + this.timeObject.duration;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    this.startTime_ = this.timeObject.time;
    this.sustainTime_ = Math.min(this.startTime_ + this.envelope.attack + this.envelope.decay, nominalEndTime);

    this.valueAtRelease_ = this.envelope.sustain;

    // Note start
    if (this.envelope.attack !== 0) {
      this.envelopeShaper_.gain.setValueAtTime(0, this.startTime_);
      //console.log("start: 0 at %s", this.startTime_); //DEBUG
      console.log("start: 0 at 0"); //DEBUG
    } else if (this.envelope.attack === 0 && this.envelope.decay !== 0) {
      this.envelopeShaper_.gain.setValueAtTime(1, this.startTime_);
      //console.log("start: 1 at %s", this.startTime_); //DEBUG
      console.log("start: 1 at 0"); //DEBUG
    } else if (this.envelope.attack === 0 && this.envelope.decay === 0) {
      this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.startTime_);
      //console.log("start: %s at %s", this.envelope.sustain, this.startTime_); //DEBUG
      console.log("start: %s at 0", this.envelope.sustain); //DEBUG
    }

    // Attack
    if (this.envelope.attack !== 0) {
      // is the note longer than the attack time?
      if (this.timeObject.duration > this.envelope.attack) {
        this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.startTime_ + this.envelope.attack);
        //console.log("attack: linear Ramp to %s at %s", 1, this.startTime_ + this.envelope.attack); //DEBUG
        console.log("attack: linear Ramp to %s at %s", 1, this.envelope.attack); //DEBUG
      } else {
        var part = this.envelope.attack / this.timeObject.duration;
        this.envelopeShaper_.gain.linearRampToValueAtTime(part, nominalEndTime);
        this.valueAtRelease_ = part;
        //console.log("attack: linear Ramp to %s at %s", part, this.startTime_ + this.envelope.attack); //DEBUG
        console.log("attack: linear Ramp to %s at %s", part, this.envelope.attack); //DEBUG
      }
    }

    if(this.envelope.decay !== 0 && this.timeObject.duration > this.envelope.attackh) {
      // Decay
      // is note longer than attack time plus decay time?
        if (this.timeObject.duration > this.envelope.attack + this.envelope.decay) {
          this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay);
          //console.log("decay: linear Ramp to %s at %s", this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay); //DEBUG
          console.log("decay: linear Ramp to %s at %s", this.envelope.sustain, this.envelope.attack + this.envelope.decay); //DEBUG
        } else {
          var part = this.envelope.decay / (this.timeObject.duration - this.envelope.attack);
          this.envelopeShaper_.gain.linearRampToValueAtTime(part * this.envelope.sustain, nominalEndTime);
          this.valueAtRelease_ = part * this.envelope.sustain;
          //console.log("decay: linear Ramp to %s at %s", part * this.envelope.sustain, nominalEndTime); //DEBUG
          console.log("decay: linear Ramp to %s at %s", part * this.envelope.sustain, this.envelope.attack); //DEBUG
        }
    }

    this.nominalEndTime_ = nominalEndTime;
  };

  Sound.prototype.end = function (now) {
    var nominalEndTime;

    if (now) {
      nominalEndTime = this.audioContext_.currentTime;
    } else {
      nominalEndTime = Math.max(this.sustainTime_, this.timeObject.time + this.timeObject.duration);
    }

    this.realEndTime_ = nominalEndTime + this.envelope.release;

    this.envelopeShaper_.gain.cancelScheduledValues(nominalEndTime);

    if (nominalEndTime <= this.realEndTime_) {
      // Sustain end
      this.envelopeShaper_.gain.setValueAtTime(this.valueAtRelease_, nominalEndTime);
      //console.log("sustain: %s at %s", this.envelope.sustain, nominalEndTime); //DEBUG
      console.log("sustain: %s at %s", this.valueAtRelease_, nominalEndTime-this.startTime_); //DEBUG

      // Release
      this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.realEndTime_);
      //console.log("release: linear Ramp to %s at %s", 0, nominalEndTime + this.envelope.release); //DEBUG
      console.log("release: linear Ramp to %s at %s", 0, this.realEndTime_ - this.startTime_); //DEBUG
    } else {
      this.envelopeShaper_.gain.setValueAtTime(0, nominalEndTime);
    }

    this.nominalEndTime_ = nominalEndTime;
  };

  Sound.prototype.getSoundState = function () {
    var currentTime = this.audioContext_.currentTime;
    if (currentTime < this.startTime_) {
      return SoundState.PLANNED;
    } else if (currentTime > this.realEndTime_) {
      return SoundState.ENDED;
    } else if (currentTime > this.nominalEndTime_) {
      return SoundState.ENDING;
    } else if (currentTime > this.sustainTime_) {
      return SoundState.SUSTAINED;
    } else {
      return SoundState.STARTED;
    }
  }; */

  Sound.prototype.getSoundState = function () {
    var currentTime = this.audioContext_.currentTime;
    if (currentTime < this.timeObject.time) {
      return SoundState.PLANNED;
    } else if (currentTime > this.releaseTime_ + this.envelope.release) {
      return SoundState.FINISHED;
    } else {
      return SoundState.RUNNING;
    }
  };

  Sound.prototype.interrupt = function () {
    this.envelopeShaper_.gain.cancelScheduledValues(0);
    this.envelopeShaper_.gain.value = 0;
  };

  Sound.prototype.setWaveType = function (waveType) {
    this.oscillator_.type = waveType;
  };

  Sound.prototype.dispose = function () {

    if (!this.disposed) {
      this.disposed = true;

      this.envelopeShaper_.gain.value = 0;

      this.oscillator_.stop(0);
      this.oscillator_.disconnect();
      this.oscillator_ = null;

      this.envelopeShaper_.gain.cancelScheduledValues(0);
      this.envelopeShaper_.disconnect();
      this.envelopeShaper_ = null;

      this.output = null;
    }
  };

})();

// #endif
