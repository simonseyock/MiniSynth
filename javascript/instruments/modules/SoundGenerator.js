// #ifndef __SOUNDEGENERATORMODULE__
// #define __SOUNDEGENERATORMODULE__

// #include "Module.js"

synth.instrument.module.SoundGenerator = function (audioContext, waveType, TimerType, voices) {
  this.audioContext_ = audioContext;

	this.gain_ = audioContext.createGain();

	this.waveType_ = waveType || "sine";

	this.voices_ = 8;

  this.voiceCollections_ = [];

	this.voiceOscillators_ = [];

  this.voiceTimers_ = [];

	for(var i=0; i<this.voices_; i++) {
    this.voiceCollections_.push(new synth.TimeCollection(0,0));

    var osc = audioContext.createOscillator();
    osc.type = waveType;
    osc.start(0);
		this.voiceOscillators_.push(osc);

    var timer = new TimerType(audioContext);
    timer.watch(this.voiceCollections_[i]);
    this.voiceTimers_.push(timer);
		osc.connect(timer.getNode());

    timer.connect(this.gain_);
	}

};
synth.inherits(synth.instrument.module.SoundGenerator, synth.instrument.module.Module);

synth.instrument.module.SoundGenerator.prototype.watch = function (collection) {
  collection.on("insert", function (timeObject) {
		for(var i=0, found=false; i<this.voices_ && !found; i++) {
			if (this.voiceTimers_[i].isFreeFor(timeObject)) {
				found = true;
        this.voiceCollections_[i].insert(timeObject);
				this.voiceOscillators_[i].frequency.setValueAtTime(timeObject.value, timeObject.time);
			}
		}
		if(!found) {
			console.warn("multi oscillator voice overflow");
      // #warning "multi oscillator voice overflow warning still in code"
		}
	}.bind(this));

  collection.on("remove", function (timeObject) {
		for(var i=0, found=false; i<this.voices_ && !found; i++) {
      if(this.voiceCollections_[i].contains(timeObject)) {
        found = true;
        this.voiceCollections_[i].remove(timeObject);
      }
		}
	}.bind(this));
};

synth.instrument.module.SoundGenerator.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.instrument.module.SoundGenerator.prototype.pause = function (when) {
  when = when || 0;
	for(var i=0; i<this.voices_; i++) {
		this.voiceTimers_[i].pause(when);
    this.voiceOscillators_[i].frequency.cancelScheduledValues(when);
	}
};

synth.instrument.module.SoundGenerator.prototype.getWaveType = function () {
  return this.waveType_;
};

synth.instrument.module.SoundGenerator.prototype.setWaveType = function (waveType) {
  this.waveType_ = waveType;
  for (var i=0; i<this.voices_; i++) {
   this.voiceOscillators_[i].type = waveType;
  }
};

synth.instrument.module.SoundGenerator.prototype.getGain = function () {
  return this.gain_.gain.value;
};

synth.instrument.module.SoundGenerator.prototype.setGain = function (gain) {
  this.gain_.gain.value = gain;
};

synth.instrument.module.SoundGenerator.prototype.updateTimes = function (when) {
  for (var i=0; i<this.voices_; i++) {
   this.voiceTimers_[i].update();
  }
};

// NOTE: Attack, Decay, Sustain, Release here
// NOTE: Maybe integrate Timer functionality into this class

// #endif
