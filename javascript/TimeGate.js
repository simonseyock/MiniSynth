// #ifndef __TIMEGATE
// #define __TIMEGATE

// #include "init.js"

// #include "timeObject.js"

synth.TimeGate = function (audioContext) {
	this.audioContext_ = audioContext;
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;
};

synth.TimeGate.prototype.addTime = function (timeObject) {
	if (synth.timeObject.includes(timeObject, this.audioContext_.currentTime)) {
		//this.gain_.gain.value = 1;
		this.gain_.gain.setValueAtTime(1, this.audioContext_.currentTime);
	} else {
		this.gain_.gain.setValueAtTime(1, timeObject.time);
	}
	this.gain_.gain.setValueAtTime(0, timeObject.time + timeObject.duration);
};

synth.TimeGate.prototype.removeTime = function (timeObject) {
	if (synth.timeObject.includes(timeObject, this.audioContext_.currentTime)) {
		//this.gain_.gain.value = 0; //this does not work
		//this.gain_.gain.setValueAtTime(0, timeObject.time); //this of course(?) doesn't work either
		this.gain_.gain.setValueAtTime(0, this.audioContext_.currentTime);
	} else {
		this.gain_.gain.setValueAtTime(0, timeObject.time);
	}
};

synth.TimeGate.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.TimeGate.prototype.getNode = function () {
	return this.gain_;
};

synth.TimeGate.prototype.interrupt = function (when) {
	this.gain_.gain.cancelScheduledValues(when);
	this.gain_.gain.setValueAtTime(0, when);
};

// #endif