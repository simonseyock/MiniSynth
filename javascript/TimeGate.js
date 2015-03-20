// #ifndef __TIMEGATE
// #define __TIMEGATE

// #include "init.js"

// #include "timeObject.js"

synth.TimeGate = function (audioContext) {
	this.audioContext_ = audioContext;
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;
	
	this.times_ = new synth.TimeCollection(0,0);
};

synth.TimeGate.prototype.addTime = function (timeObject) {
	this.times_ = this.times_.afterEqual(this.audioContext_.currentTime, true);
	
	if (synth.timeObject.includes(timeObject, this.audioContext_.currentTime)) {
		//this.gain_.gain.value = 1;
		this.gain_.gain.setValueAtTime(1, this.audioContext_.currentTime);
	} else if (timeObject.time > this.audioContext_.currentTime) {
		this.gain_.gain.setValueAtTime(1, timeObject.time);
	}
	
	if(this.times_.atTime(timeObject.time + timeObject.duration).count === 0) {
		this.gain_.gain.setValueAtTime(0, timeObject.time + timeObject.duration);
	}
	
	this.times_.insert(timeObject);
};

synth.TimeGate.prototype.removeTime = function (timeObject) {
	this.times_ = this.times_.afterEqual(this.audioContext_.currentTime, true);
	
	this.times_.remove(timeObject);
	
	if(this.times_.atTime(timeObject.time).count === 0) {
		if (synth.timeObject.includes(timeObject, this.audioContext_.currentTime)) {
			//this.gain_.gain.value = 0; //this does not work
			//this.gain_.gain.setValueAtTime(0, timeObject.time); //this of course(?) doesn't work either
			this.gain_.gain.setValueAtTime(0, this.audioContext_.currentTime);
		} else if (timeObject.time > this.audioContext_.currentTime) {
			this.gain_.gain.setValueAtTime(0, timeObject.time);
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