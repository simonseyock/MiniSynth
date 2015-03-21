// #ifndef __TIMEGATE
// #define __TIMEGATE

/*
 *
 * This class controls if a sound should be let through at a certain time or not.
 */
 
synth.TimeGate = function (audioContext) {
	this.audioContext_ = audioContext;
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;
	
	this.times_ = new synth.TimeCollection(0,0);
};

synth.TimeGate.prototype.addTime = function (timeObject) {
	this.times_ = this.times_.afterEqual(this.audioContext_.currentTime, true);
	
	if (timeObject.time + timeObject.duration > this.audioContext_.currentTime) {
		//check if gate needs to be opened immediately
		if (timeObject.time > this.audioContext_.currentTime) {
			this.gain_.gain.setValueAtTime(1, timeObject.time);
		} else {
			this.gain_.gain.setValueAtTime(1, this.audioContext_.currentTime);
		}
		
		//check if a new note starts
		if(this.times_.atTime(timeObject.time + timeObject.duration).count === 0) {
			this.gain_.gain.setValueAtTime(0, timeObject.time + timeObject.duration);
		}
	}
	this.times_.insert(timeObject);
};

synth.TimeGate.prototype.removeTime = function (timeObject) {
	this.times_ = this.times_.afterEqual(this.audioContext_.currentTime, true);
	
	if (timeObject.time + timeObject.duration > this.audioContext_.currentTime) {
		this.times_.remove(timeObject);
		
		if(this.times_.atTime(timeObject.time).count === 0) {
			if (timeObject.time < this.audioContext_.currentTime) {
				this.gain_.gain.setValueAtTime(0, this.audioContext_.currentTime);
			} else {
				this.gain_.gain.setValueAtTime(0, timeObject.time);
			}
		}
	}
};

synth.TimeGate.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.TimeGate.prototype.getNode = function () {
	return this.gain_;
};

synth.TimeGate.prototype.cancel = function (when) {
	this.gain_.gain.cancelScheduledValues(when);
};

synth.TimeGate.prototype.interrupt = function (when) {
	this.cancel(when);
	this.gain_.gain.setValueAtTime(0, when);
};

// #endif