// #ifndef __GLOBALMERGER__
// #define __GLOBALMERGER__

// #include "init.js"

/**
 *	Can only play one sound at a time (no chords possible)
 */
synth.GlobalMerger = function (audioContext) {
	synth.StateExchangeObject.call(this);
	
	this.audioContext_ = audioContext;
	
	this.gain_ = audioContext.createGain();
	
	this.addExchangeObjectArrayStateParameter("lines", this.getLines, this.setLines);
	this.setLines([]);
};
synth.inherits(synth.GlobalMerger, synth.StateExchangeObject);
synth.StateExchangeObject.addType("synth.GlobalMerger", synth.GlobalMerger);

synth.GlobalMerger.prototype.setLines = function (lines) {
	//this.merger_ = this.audioContext_.createChannelMerger(Math.max(lines.length * 2, 2));
	//this.merger_.connect(this.gain_);
	this.lines_ = lines;
	for (var i=0; i<this.lines_.length; i++) {
		lines[i].connect(this.gain_);
		//lines[i].connect(this.merger_, 1, i*2+1);
	}
};

synth.GlobalMerger.prototype.getLines = function () {
	return this.lines_;
};

synth.GlobalMerger.prototype.addLine = function (line) {
	var lines = this.getLines();
	lines.push(line);
	this.setLines(lines);
};

synth.GlobalMerger.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};


// #endif