// #ifndef __CLOCK__
// #define __CLOCK__

// #include "StateExchange.js"
// #include "Observable.js"

/**
 * This class provides a timing event named nextBar, which is listened to by playing objects of the project to know when the next notes should be played and in which tempo they should be played.
 * @class
 * @params audioContext {audioContext} the audioContext
 * @fires nextBar
 * @fires start
 * @fires stop
 * @fires tempoChange
 */

// NOTE: Global Assumption: BpM is the Velocity of Quarters

synth.Clock = function (audioContext) {
	synth.Observable.call(this);
	
	this.registerEventType("nextBar");
	this.registerEventType("start");
	this.registerEventType("stop");
	this.registerEventType("tempoChange");
	
	this.audioContext_ = audioContext;
	
	this.bpm_ = 120;
	
	this.minBpm_ = 20;
	this.maxBpm_ = 360;

	this.precognitionTime_ = 0.5; // the time between the nextBar event and the actual time of the nextBar

	/**
	 * @property started {boolean} whether the clock is started or not
	 */
	this.started = false;
	
	this.nextBar_ = 0;
	this.nextBarTime_ = 0;
	
};
synth.inherits(synth.Clock, synth.StateExchange);
synth.inherits(synth.Clock, synth.Observable);

/**
 * Gives the BpM of the clock
 * NOTE: not whenable
 * @method
 * @returns bpm {float} the BpM (Beats per Minute) of the clock. It is assumed that every bar is 4/4
 */
synth.Clock.prototype.getBpM = function () {
	return this.bpm_;
};

/**
 * Changes the tempo of the clock
 * NOTE: not whenable
 * @method
 * @param bpm {float} the BpM (Beats per Minute) of the clock. It is assumed that every bar is 4/4
 */
synth.Clock.prototype.setBpM = function (bpm) {
		
	var oldBpM = this.bpm_;
	var oldBarLength = this.getBarLength();
	
	this.bpm_ = Math.min(this.maxBpm_, Math.max(this.minBpm_, bpm));
	
	if (this.started) {
		
		var barTimeBeforeTimeChange = this.nextBarTime_ - oldBarLength;
		
		var oldTempoPart = (this.audioContext_.currentTime - barTimeBeforeTimeChange) / oldBarLength;
		var newTempoPart = 1 - oldTempoPart;
		
		// console.log("when: %f timeBefore: %f oldBarLength: %f newBarLength: %f oldNextBar: %f newNextBar: %f now: %f", 
			// when, barTimeBeforeTimeChange, oldBarLength, this.getBarLength(), this.nextBarTime_, when + (1 - oldTempoPart) * this.getBarLength(), this.audioContext_.currentTime);			
		
		this.nextBarTime_ = this.audioContext_.currentTime + (1 - oldTempoPart) * this.getBarLength(); 
		this.makeLoop_();
	}
	
	/**
	 * tempoChange Event
	 * @event tempoChange
	 * @property multiplier {float} a multiplier to get from the old to the new tempo
	 */
	this.fireEvent("tempoChange", [oldBpM/bpm]);
};

/**
 * NOTE: not whenable
 * @method
 * @returns barLength {float} The length of a bar in seconds
 */
synth.Clock.prototype.getBarLength = function () {
	return 60 / this.bpm_ * 4;
};

/**
 * Starts the clock at specified time or now
 * @method
 * @param when {float} time to start the clock
 */
synth.Clock.prototype.start = function (when) {
	
	when = when || this.audioContext_.currentTime;
	
	/**
	 * start Event
	 * @event start
	 * @property when {float} the time the clock starts
	 */
	this.fireEvent("start", [when]);
	
	/**
	 * nextBar Event - see below
	 */
	this.fireEvent("nextBar", [ 0, when ] );
	
	this.nextBar_ = 1;
	this.nextBarTime_ = when + this.getBarLength();
	this.makeLoop_(when);
	
	this.started = true;
};

/**
 * Stops the clock at specified time or now
 * @param when {float} time to stop the clock
 * @method
 */
synth.Clock.prototype.stop = function (when) {
	setTimeout(function () {
		this.started = false;
	
		clearTimeout(this.loopTimeout);
		
		/**
		 * stop Event
		 * @event stop
		 * @property when {float} the time the clock stops
		 */
		this.fireEvent("stop", [when]);
	}.bind(this), (when - this.audioContext_.currentTime) * 1000)
};

/**
 * This method creates a self adjusting loop which fires the nextBar event
 * @private
 * @method
 */
synth.Clock.prototype.makeLoop_ = function () {
	clearInterval(this.loopTimeout);
	
	var loop = function () {
		/**
		 * nextBar Event
		 * @event nextBar
		 * @property barNumber {int} which bar it is
		 * @property when {float} at which time this bar starts
		 */
		this.fireEvent("nextBar", [this.nextBar_, this.nextBarTime_]);

		this.nextBar_++;
		this.nextBarTime_ += this.getBarLength();
		this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.precognitionTime_) * 1000);
	}.bind(this);
	
	this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.precognitionTime_) * 1000);
};

// #endif