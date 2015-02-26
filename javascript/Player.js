// #ifndef __PLAYER__
// #define __PLAYER__

// #include "init.js"
// #include "StateExchangeObject.var.js"

synth.player = synth.player || {};

synth.player.Player = function () {
	synth.StateExchangeObject.call(this);
	
	this.addExchangeObjectStateParameter("instrument", this.getInstrument, this.setInstrument);
};
synth.inherits(synth.player.Player, synth.StateExchangeObject);

synth.player.Player.prototype.getInstrument = function () {
	return this.instrument_;
};

synth.player.Player.prototype.setInstrument = function (instrument) {
	this.instrument_ = instrument;
};

synth.player.Player.prototype.playBar = synth.abstractFunction;

// #endif