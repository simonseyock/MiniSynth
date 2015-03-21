// #ifndef __TIMECOLLECTION__
// #define __TIMECOLLECTION__

// #include "ObservableObject.js"

/**
 * This is a class which stores a collection of timed objects. Each timeObject must have a time, a duration, a value (comparable), they are identified by all this three parameters combined and can have any additional data.
 * It provides many helper methods.
 * It is chainable. 
 * @class
 * @fires insert
 * @fires remove
 * @fires objectChanged
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

/**
 * Inserts a timeObject
 * @param timeObject {object}
 * @method
 */
synth.TimeCollection.prototype.insert = function (timeObject) {
	this.timeObjects_.push(timeObject);
	this.count++;
	
	/**
	 * Insert Event
	 * @event insert
	 * @property timeObject {object} the inserted timeObject
	 */
	this.fireEvent("insert", [timeObject]);
	
	return this;
};

/**
 * Removes the first occurance of timeObject
 * @param timeObject {object}
 * @method
 */
 synth.TimeCollection.prototype.remove = function (timeObject) {
	for(var i=0, found=false; i<this.count && !found; i++) {
		if(timeObject.time == this.timeObjects_[i].time && timeObject.duration == this.timeObjects_[i].duration && timeObject.value == this.timeObjects_[i].value) {
			this.timeObjects_.splice(i, 1);
			found = true;
			this.count--;
			
			/**
			 * Remove Event
			 * @event remove
			 * @property timeObject {object} the removed timeObject
			 */
			this.fireEvent("remove", [timeObject]);
		}
	}

	return this; // return found
};

/**
 * Takes a function which is executed for every timeObject inside this collection.
 * @param callback {function}
 * @method
 */
synth.TimeCollection.prototype.forEach = function (callback) {
	this.timeObjects_.forEach(callback);
};

/**
 * Returns a new collection containing all objects before the given time. If overlapping is set to true it also contains objects which start, but don't end before the given time. 
 * @method
 * @param when {float} time
 * @param overlapping {boolean}
 */
synth.TimeCollection.prototype.before = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(this.begin, when);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time + this.timeObjects_[i].duration < when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if( overlapping && this.timeObjects_[i].time < when ) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	return newTimeCollection;
};


/**
 * Returns a new collection containing all objects before or equal the given time. If overlapping is set to true it also contains objects which start, but don't end before or equal the given time. 
 * @method
 * @param when {float} time
 * @param overlapping {boolean} 
 */
synth.TimeCollection.prototype.beforeEqual = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(this.begin, when);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time + this.timeObjects_[i].duration <= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if( overlapping && this.timeObjects_[i].time <= when ) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	return newTimeCollection;
};


/**
 * Returns a new collection containing all objects after the given time. If overlapping is set to true it also contains objects which start, but don't end after the given time. 
 * @method
 * @param when {float} time
 * @param overlapping {boolean} 
 */
synth.TimeCollection.prototype.after = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(when, this.end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time > when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if (overlapping && this.timeObjects_[i].time + this.timeObjects_[i].duration > when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
	return newTimeCollection;
};

/**
 * Returns a new collection containing all objects after or equal the given time. If overlapping is set to true it also contains objects which start, but don't end after or equal the given time. 
 * @method
 * @param when {float} time
 * @param overlapping {boolean} 
 */
synth.TimeCollection.prototype.afterEqual = function (when, overlapping) {
	var newTimeCollection = new synth.TimeCollection(when, this.end);
	for (var i=0; i<this.count; i++) {
		if (this.timeObjects_[i].time >= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		} else if (overlapping && this.timeObjects_[i].time + this.timeObjects_[i].duration >= when) {
			newTimeCollection.insert(this.timeObjects_[i]);
		}
	}
	
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


/**
 * Clones a timeCollection and all containing timeObjects
 * @method
 */
synth.TimeCollection.prototype.clone = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		newTimeCollection.insert(_.cloneDeep(timeObject));
	});
	return newTimeCollection;
};


// synth.TimeCollection.prototype.clear = function () {
	// for (var i=0, ii=this.count; i<ii; i++) {
		// this.count--;
		// this.fireEvent("remove", [this.timeObjects_.shift()]);
	// };
	// return this;
// };


/**
 * Adds a given time to all times of the timeObjects 
 * @method
 */
synth.TimeCollection.prototype.timeAdd = function (time) {
	this.begin += time;
	this.end += time;
	//var newTimeCollection = this.clone();
	this.forEach(function (timeObject) {
		timeObject.time += time;
		/**
		 * Object changed Event
		 * @event objectChanged
		 * @property timeObject {object} the changed object
		 */
		this.fireEvent("objectChanged", [timeObject]);
	}.bind(this));
	return this;
};


/**
 * Multiply a given value to all times of the timeObjects 
 * @method
 */
synth.TimeCollection.prototype.timeMultiply = function (value) {
	this.begin *= value;
	this.end *= value;
	this.forEach(function (timeObject) {
		timeObject.time *= value;
		/**
		 * Object changed Event
		 * @event objectChanged
		 * @property timeObject {object} the changed object
		 */
		this.fireEvent("objectChanged", [timeObject]);
	}.bind(this));
	return this;
};

/**
 * Sorts the collection by time
 * @method
 */
synth.TimeCollection.prototype.sort = function () {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	_.sortBy(this.timeObjects_, 'time').forEach(function (timeObject) {
		newTimeCollection.insert(timeObject);
	});
	return newTimeCollection;
};

/**
 * Returns a new collection containing all time Objects which are at this time
 * @method
 */
synth.TimeCollection.prototype.atTime = function (time) {
	var newTimeCollection = new synth.TimeCollection(this.begin, this.end);
	this.forEach(function (timeObject) {
		if(timeObject.time <= time && timeObject.time + timeObject.duration >= time) {
			newTimeCollection.insert(timeObject);
		}
	});
	
	return newTimeCollection;
};

// #endif