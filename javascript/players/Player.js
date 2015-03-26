// #ifndef __PLAYER__
// #define __PLAYER__

// #include "../StateExchange.js"

synth.player = synth.player || {};

synth.player.Player = function () {
	synth.StateExchange.call(this);
	
	this.addExchangeObjectStateParameter("instrument", this.getInstrument, this.setInstrument);
};
synth.inherits(synth.player.Player, synth.StateExchange);

synth.player.Player.prototype.getInstrument = function () {
	return this.instrument_;
};

synth.player.Player.prototype.setInstrument = function (instrument) {
	this.instrument_ = instrument;
};

synth.player.Player.prototype.playIntervall = synth.abstractFunction;

// #endif