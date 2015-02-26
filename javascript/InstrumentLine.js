// #ifndef __INSTRUMENTLINE__
// #define __INSTRUMENTLINE__

// #include "init.js"

/**
 *	Can only play one sound at a time (no chords possible)
 */
synth.InstrumentLine = function (audioContext) {
	synth.StateExchangeObject.call(this);
	
	this.addExchangeObjectStateParameter("player", this.getPlayer, this.setPlayer);
	this.player_ = null;
	
	//opt midi effect chain
	
	this.addExchangeObjectStateParameter("instrument", this.getPlayer, this.setPlayer);
	this.instrument_ = null;
	
	//opt audio effect chain
	
	this.gain_ = audioContext.createGain();
};
synth.inherits(synth.InstrumentLine, synth.StateExchangeObject);
synth.StateExchangeObject.addType("synth.InstrumentLine", synth.InstrumentLine);

synth.InstrumentLine.prototype.setPlayer = function (player) {
	this.player_ = player;
	if (this.instrument_) {
		this.player_.setInstrument(this.instrument_);
	}
};

synth.InstrumentLine.prototype.getPlayer = function () {
	return this.player_;
};

synth.InstrumentLine.prototype.setInstrument = function (instrument) {
	this.instrument_ = instrument;
	if (this.player_) {
		this.player_.setInstrument(this.instrument_);
	}
	this.instrument_.connect(this.gain_);
};

synth.InstrumentLine.prototype.getInstrument = function () {
	return this.instrument_;
};

synth.InstrumentLine.prototype.connect = function (anAudioNode) {
	this.gain_.connect(anAudioNode);
};

// #endif