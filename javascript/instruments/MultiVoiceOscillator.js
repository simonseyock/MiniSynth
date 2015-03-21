// #ifndef __MULTIOSCILLATOR__
// #define __MULTIOSCILLATOR__

// #include "Instrument.js"
// #include "SingleVoiceOscillator.js"

synth.instrument = synth.instrument || {};

/**
 *	Can play multiple sounds at a time
 */
synth.instrument.MultiVoiceOscillator = function (audioContext, waveType, voices, opt_scale) {
	
	this.audioContext_ = audioContext;

	this.gain_ = audioContext.createGain();
	
	this.waveType_ = waveType || "sine";
	
	this.voices_ = 8;
	
	this.voiceOscillators_ = [];
	
	for(var i=0; i<this.voices_; i++) {
		var osc = new synth.instrument.SingleVoiceOscillator(this.audioContext_, this.waveType_, this.scale_);
		this.voiceOscillators_.push(osc);
		osc.connect(this.gain_);
	}
	
	synth.instrument.Instrument.call(this, audioContext, opt_scale);
	
	this.frequenciesToPlay.on("insert", function (timeObject) {
		for(var i=0, found=false; i<this.voices_ && !found; i++) {
			if (this.voiceOscillators_[i].frequenciesToPlay.after(timeObject.time, true).before(timeObject.time + timeObject.duration, true).count == 0) {
				found = true;
				this.voiceOscillators_[i].addFrequency(timeObject);
			}
		}
		if(!found) {
			console.warn("multi oscillator voice overflow");
		}
	}.bind(this));
	
	this.frequenciesToPlay.on("remove", function (timeObject) {
		for(var i=0; i<this.voices_; i++) {
			this.voiceOscillators_[i].removeFrequency(timeObject);
		}
	}.bind(this));
};
synth.inherits(synth.instrument.MultiVoiceOscillator, synth.instrument.Instrument);
synth.StateExchangeObject.addType("synth.instrument.MultiVoiceOscillator", synth.instrument.MultiVoiceOscillator);

synth.instrument.MultiVoiceOscillator.prototype.setScale = function (scale) {
	for (var i=0; i<this.voices_; i++) {
		this.voiceOscillators_[i].setScale(scale);
	}
	synth.instrument.Instrument.prototype.setScale.call(this, scale);
};

// synth.instrument.MultiVoiceOscillator.prototype.playFrequency = function (frequency, time, duration) {
	

	// //this variant of the mechanism does assume the values come in in the order they are played
	// this.simpleOscillators_[this.oscIndex_].playFrequency(frequency, time, duration);
	
	// this.oscIndex_ = (this.oscIndex_ + 1) % this.numVoices_;
	
	// //console.log("time:",time);
	// // for (var i=0, found=false; i<this.numVoices_ && !found; i++) {
		// // //console.log("osc:", i);
		// // if (this.simpleOscillators_[i].isFree(time, duration)) {
			// // //console.log("is free");
			// // this.simpleOscillators_[i].playFrequency(frequency, time, duration);
			// // found = true;
		// // }
	// // }
	// // if(!found) {
		// // //interrupt a random oscillator at that time ... not that good, it's not the same sound anymore everytime you play it
		// // this.simpleOscillators_[Math.rand()%this.numVoices_].playFrequency(frequency, time, duration);
	// // }
// };

synth.instrument.MultiVoiceOscillator.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

synth.instrument.MultiVoiceOscillator.prototype.start = function (when) {
	when = when || 0;
	for(var i=0; i<this.voices_; i++) {
		this.voiceOscillators_[i].start(when);
	}
};

synth.instrument.MultiVoiceOscillator.prototype.interrupt = function (when) {
	when = when || 0;
	for(var i=0; i<this.voices_; i++) {
		this.voiceOscillators_[i].interrupt(when);
	}
}

// #endif