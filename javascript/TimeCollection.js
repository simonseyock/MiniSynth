// #ifndef __TIMECOLLECTION__
// #define __TIMECOLLECTION__

// #include "ObservableObject.js"

/**
 * 		timeObjects must have a time, a duration, a value (comparable), they are identified by all this three parameters combined and can have any additional data.
 * @class
 */

synth.TimeCollection = function (begin, end, options) {
	synth.ObservableObject.call(this);
	
	options = options || {};
	
	this.timeObjects_ = [];
	this.count = 0;
	
	if (_.isNaN(begin) || _.isNaN(end)) {
		throw new Error("TimeCollection needs a begin and an end!"); // NOTE: really?
	}
	this.begin = begin;
	this.end = end;
	  
	//this.lines_ = false;
	//this.flat_ = false;
	
	this.registerEventType("insert");
	this.registerEventType("remove");
	this.registerEventType("objectChanged");
	//this.registerEventType("object:change");
};
synth.inherits(synth.TimeCollection, synth.ObservableObject);

// synth.TimeCollection.prototype.bind_ = function (aTimeCollection, transform) {
	// transform = transform || function (v) { return v; };
	
	// aTimeCollection.on("insert", function (timeObject) {
		// this.insert(transform(timeObject));
	// }.bind(this));
	// aTimeCollection.on("remove", function (timeObject) {
		// this.remove(tranform(timeObject));
	// }.bind(this));
	// aTimeCollection.on("objectChanged", function (oldObject, newObject) {
		// var oldTransformed = transform(oldObject);
		// this.forEach(function (timeObject) {
			
		// });
	// }.bind(this));
// };

//insert with ? 

synth.TimeCollection.prototype.insert = function (timeObject) {
	this.timeObjects_.push(timeObject);
	this.count++;
	this.fireEvent("insert", [timeObject]);
	
	return this;
};

//insert more efficient search maybe? 

synth.TimeCollection.prototype.remove = function (timeObject) {
	for(var i=0, found=false; i<this.count && !found; i++) {
		if(timeObject.time == this.timeObjects_[i].time && timeObject.duration == this.timeObjects_[i].duration && timeObject.value == this.timeObjects_[i].value) {
			this.timeObjects_.splice(i, 1);
			found = true;
			this.count--;
			this.fireEvent("remove", [timeObject]);
		}
	}

	return this; // return found
};

synth.TimeCollection.prototype.between = function (begin, end) {
	var newTimeCollection = new synth.TimeCollection(begin, end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time >= begin && this.timeObjects_[i].time < end) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	return newTimeCollection;
	
	//return this.afterEqual(begin).before(end); 
};

synth.TimeCollection.prototype.forEach = function (callback) {
	this.timeObjects_.forEach(callback);
};

synth.TimeCollection.prototype.before = function (when) {
	var newTimeCollection = new synth.TimeCollection(this.begin, when);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time < when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	return newTimeCollection;
};

synth.TimeCollection.prototype.afterEqual = function (when) {
	var newTimeCollection = new synth.TimeCollection(when, this.end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time >= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	newTimeCollection
	
	return newTimeCollection;
};

// synth.TimeCollection.prototype.merge = function (anotherTimeCollection) {
	// var newTimeCollection = new synth.TimeCollection(Math.min(this.begin, anotherTimeCollection.begin), Math.max(this.end, anotherTimeCollection.end));
	
	// this.forEach( function (timeObject) { 
		// newTimeCollection.insert(_.cloneDeep(timeObject));
	// } );
	
	// anotherTimeCollection.forEach(function (timeObject) {
		// newTimeCollection.insert(_.cloneDeep(timeObject));
	// } );
	
	// return newTimeCollection;
// };

synth.TimeCollection.prototype.clone = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		newTimeCollection.insert(_.cloneDeep(timeObject));
	});
	return newTimeCollection;
};

synth.TimeCollection.prototype.timeAdd = function (time) {
	this.begin += time;
	this.end += time;
	//var newTimeCollection = this.clone();
	this.forEach(function (timeObject) {
		timeObject.time += time;
		this.fireEvent("objectChanged", [timeObject]);
	}.bind(this));
	return this;
};

synth.TimeCollection.prototype.timeMultiply = function (time) {
	this.begin *= time;
	this.end *= time;
	this.forEach(function (timeObject) {
		timeObject.time *= time;
		this.fireEvent("objectChanged", [timeObject]);
	}.bind(this));
	return this;
};

synth.TimeCollection.prototype.sort = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	_.sortBy(this.timeObjects_, 'time').forEach(function (timeObject) {
		newTimeCollection.insert(timeObject);
	});
	return newTimeCollection;
};

synth.TimeCollection.prototype.atTime = function (time) {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		if(timeObject.time < time && timeObject.time + timeObject.duration > time) {
			newTimeCollection.insert(timeObject);
		}
	});
	
	return newTimeCollection;
};


// synth.TimeCollection.prototype.addTimed = function (timedFunction) {
	// this.timedFunctions_.push(timedFunction);
// };

// synth.TimeCollection.prototype.removeTimed = function (timedFunction) {
	
	// this.timedFunctions_.push(timedFunction);
	// this.timedAdvances_.push(timedAdvance || this.timedAdvanceDefault_);
// };

//var b
// synth.TimeCollection.prototype.controlAudioParam = function (audioParam) {
	
// };

// maybe:
// TimedAudioParamController uses a TimeCollection to control an AudioParam <-
// or
// An unknown controller uses TimeCollection to time an AudioParam

// Question: when to give the time to an audioaparam ... alternatives:
// a) long time before (like one bar in advance)
// b) shortly before a bar starts
// c) shortly before a note starts <-

//other idea: having a controlNode which directly controls input/output of a node. Advantage: it could start and stop the node while a note is playing


//aaand: add a warning when timedAdvance is overrun

// TimeCollection
	// ^
	// |
// loopTimeTimeCollection

// #endif