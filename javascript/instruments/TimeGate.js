// #ifndef __TIMEGATE
// #define __TIMEGATE

/*
 *
 * This class controls if a sound should be let through at a certain time or not.
 * NOTE: TimeGate does not support layered timeCollections, they need to be flat, at most the notes may start and begin at the same time.
 */

synth.TimeGate = function (audioContext, collection) {
	this.audioContext_ = audioContext;
	this.gain_ = audioContext.createGain();
	this.gain_.gain.value = 0;

  this.collection_ = collection;

  this.collection_.on("insert", function (timeObject) {
    this.addTime_(timeObject);
  }.bind(this));

  this.collection_.on("remove", function (timeObject) {
    this.removeTime_(timeObject);
  }.bind(this));


  /*this.collection_.on("objectChanged", function (e) {
    this.removeTime_(e.old);
    this.addTime_(e.new);
  }.bind(this));*/
  //does not work because notes will overlap
  // instead an update function needs to be called after all objects have been changed
};

synth.TimeGate.prototype.update = function (when) {
  this.cancel(when);

  this.collection_.afterEqual(when, true).forEach(function (timeObject) {
    this.addTime_(timeObject);
  }.bind(this));
};


synth.TimeGate.prototype.addTime_ = function (timeObject) {

  // check if note is to be played
	if (timeObject.time + timeObject.duration > this.audioContext_.currentTime) {
		//check if gate needs to be opened immediately
		if (timeObject.time > this.audioContext_.currentTime) {
			this.gain_.gain.setValueAtTime(1, timeObject.time);
		} else {
			this.gain_.gain.setValueAtTime(1, this.audioContext_.currentTime);
		}

		//check if no new notes start at the end of this note
		if(this.collection_.atTime(timeObject.time + timeObject.duration).count === 1) {
			this.gain_.gain.setValueAtTime(0, timeObject.time + timeObject.duration);
		}

    //check for overlapping notes ...
	}
};

synth.TimeGate.prototype.removeTime_ = function (timeObject) {

  // check if note needs to be muted
	if (timeObject.time + timeObject.duration > this.audioContext_.currentTime) {

    //due to the assumption that the collection is flat, we need in any case:

    if (timeObject.time < this.audioContext_.currentTime) {
      this.gain_.gain.setValueAtTime(0, this.audioContext_.currentTime);
    } else {
      this.gain_.gain.setValueAtTime(0, timeObject.time);
    }

    /*var count = this.collection_.atTime(timeObject.time).count;
    //check if the start of the note needs to be muted
		if( this.collection_.atTime(timeObject.time).count === 0) {
			if (timeObject.time < this.audioContext_.currentTime) {
				this.gain_.gain.setValueAtTime(0, this.audioContext_.currentTime);
			} else {
				this.gain_.gain.setValueAtTime(0, timeObject.time);
			}
    } else {
      // a new end has to be found
      var last
      this.collection_.atTime(timeObject.time)
    }*/
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
