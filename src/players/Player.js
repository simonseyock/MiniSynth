// #ifndef __PLAYER__
// #define __PLAYER__

// #include "../StateExchangable.js"

synth.player = synth.player || {};

synth.player.Player = function () {
  synth.Observable.call(this);
	synth.StateExchangable.call(this);
};
synth.inherits(synth.player.Player, synth.StateExchangable);
synth.inherits(synth.player.Player, synth.Observable);

synth.player.Player.prototype.getInstrument = function () {
	return this.instrument_;
};

synth.player.Player.prototype.setInstrument = function (instrument) {
	this.instrument_ = instrument;
};

synth.player.Player.prototype.playBar = synth.abstractFunction;

// #endif
