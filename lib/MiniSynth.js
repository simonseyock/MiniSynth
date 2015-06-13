/*
 * This file is the main assembly file for the project. Maintaining all available parts.
 */

window.synth = window.synth || {};

(function () {

var synth = window.synth;

/*
 * This file contains structural helper functions
 */

synth.inherits = function (child, parent) {
	jQuery.extend(child.prototype, parent.prototype);
};

synth.abstractFunction = function () {
	throw new Error("You tried to call an abstract function. Yuck.");
};




synth.Observable = function ( opt_options ) {

    opt_options = opt_options || {};

    this.EventListeners_ = this.EventListeners_ || {};
    this.customKey_ = this.customKey_ || 0;
};

/**
 * This will register the event type and will prevent spelling mistakes ;)
 */

synth.Observable.prototype.registerEventType = function (type) {
    this.EventListeners_[type] = [];
};

/**
 * Fires all eventhandlers/listeners applied to the object with type type
 * Will not get passed to passClass.
 * @param {string} type type of the event f.e. "change"
 * @param {Array} passArgs an array of arguments which will be applied (using .apply) to the eventhandlers/listeners
 */

synth.Observable.prototype.fireEvent = function ( type, passArgs ) {

    if ( type in this.EventListeners_ ) {
        for (var i=0; i< this.EventListeners_[type].length; i++) {
            var listener = this.EventListeners_[type][i];

            var this_ = listener.opt_this || this;
            if (typeof(listener.listener) === "function" ) {
                listener.listener.apply( this_, passArgs );
            }

            if (listener.once) {
                this.EventListeners_[type].splice(i, 1);
                i--;
            }
        }
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

//synth.Observable.prototype.hasListenersOnEvent = function ( type ) {

//    if ( type in this.EventListeners_ ) {
//        return this.EventListeners_[type].length > 0;
//    } else {
//        throw "EventType: '" + type + "' doesn't exist!";
//    }
//};

/**
 * Registers a listener to fire every time the given event occurs
 * @method
 */
synth.Observable.prototype.on = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        var key = this.customKey_++;
        this.EventListeners_[type].push( { listener: listener, opt_this: opt_this, once: false, key: key } );
        return { type: type, key: key };
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Registers a listener to fire once the given event occurs
 * @method
 */
synth.Observable.prototype.once = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        var key = this.customKey_++;
        this.EventListeners_[type].push( { listener: listener, opt_this: opt_this, once: true, key: key } );
        return { type: type, key: key };
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Removes a given listener for an event
 * @method
 */
synth.Observable.prototype.un = function ( type, listener, opt_this ) {
    if ( type in this.EventListeners_ ) {
        for ( var i = 0; i < this.EventListeners_[type].length; i++ ) {

            if (this.EventListeners_[type][i].listener === listener) {
                this.EventListeners_[type].splice(i, 1);
                i--;
            }
        }
    } else {
        throw "EventType: '" + type + "' doesn't exist!";
    }
};

/**
 * Removes a listener identified by the key which is returned by on or once
 * @method
 */
synth.Observable.prototype.unByKey = function ( key ) {
    if ( "type" in key ) {
        if (key.type in this.EventListeners_) {
            for (var i=0; i< this.EventListeners_[key.type].length; i++) {

                if (this.EventListeners_[key.type][i].key === key.key) {
                    this.EventListeners_[key.type].splice(i, 1);
                    i--;
                }
            }
        } else {
            throw "EventType: '" + key.type + "' doesn't exist!";
        }
    } else {
        throw "invalid key: '" + key  + "'!";
    }
};



/**
 * Helpers
 */

var helpers = helpers || {};

helpers.timeObjectsEqual = function (tO1, tO2) {
  return tO1.time === tO2.time && tO1.duration === tO2.duration && tO1.value === tO2.value;
};

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
	synth.Observable.call(this);

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
synth.inherits(synth.TimeCollection, synth.Observable);

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
		if(helpers.timeObjectsEqual(this.timeObjects_[i], timeObject)) {
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
    var old = _.cloneDeep(timeObject);
		timeObject.time += time;
		/**
		 * Object changed Event
		 * @event objectChanged
     * @type {object}
		 * @property old {object} a copy of the old object
     * @property new {object} the new object
		 */
    this.fireEvent("objectChanged", [{old: old, new: timeObject}]);
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

/**
 * Returns true if the collection contains the timeObject
 * @method
 */
synth.TimeCollection.prototype.contains = function (checkTimeObject) {
	var found = false;
	this.forEach(function (timeObject) {
		if (timeObject.time === checkTimeObject.time && timeObject.duration === checkTimeObject.duration && timeObject.value === checkTimeObject.value) {
      found = true;
    }
	});

	return found;
};


synth.ChangeFiring = function () {
  synth.Observable.call(this);
  this.properties_ = {};
  //this.registerEventType("propertychange");
};
synth.inherits(synth.ChangeFiring, synth.Observable);
synth.ChangeFiring.prototype.bindProperty = function (propertyName, otherObject, otherPropertyName) {
  this.on("change:" + propertyName, function (e) {
//    console.log(e.newValue);
    otherObject.set(otherPropertyName, e.newValue);
  });
  otherObject.on("change:" + otherPropertyName, function (e) {
//    console.log(e.newValue);
    this.set(propertyName, e.newValue);
  }.bind(this));
};
synth.ChangeFiring.prototype.set = function (propertyName, value) {
  if (!this.properties_.hasOwnProperty(propertyName)) {
    this.registerEventType("change:" + propertyName);
    this.properties_[propertyName] = value;
  } else {
    var oldValue = this.properties_[propertyName];
    this.properties_[propertyName] = value;
    if (oldValue !== value) {
      var e = { oldValue: oldValue, newValue: value };
//      console.log(propertyName);
  //    console.log(e);
      this.fireEvent("change:" + propertyName, [e]);
      //this.fireEvent("propertychange", [e]);
    }
  }
};
synth.ChangeFiring.prototype.get = function (propertyName) {
  return this.properties_[propertyName];
};


synth.html = synth.html || {};
synth.html.RotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  synth.ChangeFiring.call(this);
  this.set("value", opt_options.initial || 0);
	this.spareDegrees = 90;
	this.resolution = 0.0025;
	this.className_ = "rotary-control";
  this.classNameTitle_ = this.className_ + "-title";
	this.classNameSVG_ = this.className_ + "-svg";
	this.classNamePointer_ = this.className_ + "-pointer";
	this.classNameValueField_ = this.className_ + "-valuefield";
	this.$element_ = $("<div>").addClass(this.className_);
  if (opt_options.title) {
    this.$element_.append($("<div>").addClass(this.classNameTitle_).append(opt_options.title));
  }
	this.strokeWidth_ = 8;
	this.radius_ = 26;
	this.pointerLength_ = 25;
	this.pointerDistanceFromCenter_ = 12;
	this.dotRadius = 4;
	this.dotMinDistanceFromBorder_ = 2;
	this.$svg_ = $('<svg viewBox = "0 0 100 100" version = "1.1"></svg>').attr("class", this.classNameSVG_);
	this.$element_.append(this.$svg_);
	this.$svg_.html('<circle cx="50" cy="50" r="' + this.radius_ + '" stroke-width="' + this.strokeWidth_ + '" fill="transparent" />'
		+'<rect class="' + this.classNamePointer_ + '" width="' + this.strokeWidth_ + '" height="' + this.pointerLength_ + '" x="' + (50 - this.strokeWidth_/2) + '" y="' + (50 + this.pointerDistanceFromCenter_) + '"/>');
	var thisRef = this;
	this.$svg_.on("mousedown", function (e) {
		thisRef.onSVGMouseDown_(e);
	});
	this.$svg_.on("touchstart", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onSVGMouseDown_(e);
	});
	$(document).on("mousemove", function (e) {
		thisRef.onDocMouseMove_(e);
	});
	this.$svg_.on("touchmove", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		thisRef.onDocMouseMove_(e);
	});
	$(document).on("mouseup touchend", function (e) {
		thisRef.onDocMouseUp_(e);
	});
	this.$valueField_ = $('<input type="text" disabled>').addClass(this.classNameValueField_).addClass("synth-input-camouflage");
	this.$element_.append($("<div>").append(this.$valueField_));
	this.set("position", null);
  this.on("change:value", this.updatePositionFromValue);
  this.on("change:position", this.updateValueFromPosition);
  this.on("change:position", this.onChangePosition);
};
synth.inherits(synth.html.RotaryControl, synth.ChangeFiring);
synth.html.RotaryControl.prototype.get$Element = function () {
  return this.$element_;
};
synth.html.RotaryControl.prototype.createDots_ = function () {
	var alpha, x, y;
	for(var i=0; i<this.dots_.length; i++) {
		alpha = (this.spareDegrees/2 + (360-this.spareDegrees)*this.dots_[i]);
		x = -Math.sin(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		y = Math.cos(alpha/360*2*Math.PI) * (50 - this.dotMinDistanceFromBorder_ - this.dotRadius) + 50;
		this.$svg_.html(this.$svg_.html() + '<circle cx="' + x +'" cy="' + y +'" r="' + this.dotRadius + '" />');
	}
};
synth.html.RotaryControl.prototype.onSVGMouseDown_ = function (e) {
	this.mouseMove_ = true;
	this.lastY_ = e.pageY;
	e.preventDefault();
};
synth.html.RotaryControl.prototype.onDocMouseMove_ = function (e) {
	if(this.mouseMove_) {
		var distance = this.lastY_ - e.pageY;
		var newValue = Math.max(0, Math.min(this.get("position") + distance*this.resolution, 1));
		this.set("position", this.shorten(newValue));
		this.lastY_ = e.pageY;
	}
};
synth.html.RotaryControl.prototype.onDocMouseUp_ = function (e) {
	this.mouseMove_ = false;
};
synth.html.RotaryControl.prototype.onChangePosition = function (e) {
  //console.log(this.get("position"));
  var transformString = "rotate(" + (this.spareDegrees/2 + (360-this.spareDegrees)*e.newValue) + " 50 50)";
  this.$svg_.children("."+this.classNamePointer_).attr("transform", transformString);
};
synth.html.RotaryControl.prototype.shorten = function (value) {
  return parseFloat(value.toFixed(9));
};


//AnalogRotaryControl.prototype.setTransformFunctions = function (from, to) {
//	this.valueFromExternal_ = from
//	this.valueToExternal_ = to;
//};
/**
 * AnalogRotaryControl
 * @class
 *
 *
 */
// TODO: Use setters, getters from ChangeFiring
synth.html.AnalogRotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  this.min_ = opt_options.min || 0;
  this.max_ = opt_options.max || 1;
  if (opt_options.hasOwnProperty("logarithmic") && opt_options.logarithmic) {
    if(this.min_ < 0) {
      throw new Error("With logarithmic behaviour the min value can't be smaller than 0.");
    }
    this.interpretValueBelowAsZero_ = opt_options.interpretValueBelowAsZero || false;
    this.mappingFunction_ = function (x) {
      return this.min_/Math.E * Math.exp(Math.log(this.max_*Math.E/this.min_)*x);
    };
    this.inverseMappingFunction_ = function (y) {
      //if (y === 0) {
      //  y = this.min_;
      //}
      return Math.log(y*Math.E/this.min_) / Math.log(this.max_*Math.E/this.min_);
    };
  } else {
    this.mappingFunction_ = function (x) {
      return this.min_ + x * (this.max_ - this.min_)
    };
    this.inverseMappingFunction_ = function (y) {
      return (y - this.min_) / (this.max_ - this.min_);
    };
  }
  opt_options.initial = Math.min(this.max_, Math.max(this.min_, opt_options.initial || this.min_));
	synth.html.RotaryControl.call(this, opt_options);
  this.dots_ = [0,1];
  this.createDots_();
  this.displayPrecision_ = opt_options.displayPrecision || 3;
  this.unit_ = opt_options.unit || "";
  this.setEditable(opt_options.editable || true);
  //this.set("value",);
  this.updatePositionFromValue();
  this.updateValueField();
  this.on("change:value", this.updateValueField);
};
synth.inherits(synth.html.AnalogRotaryControl, synth.html.RotaryControl);
synth.html.AnalogRotaryControl.prototype.updateValueField = function () {
//  if (this.interpretValueBelowAsZero_ !== false && value < this.interpretValueBelowAsZero_) {
//    value = 0;
//  } else {
//    value = Math.min(this.max_, Math.max(this.min_, value));
//  }
  var displayValue = this.get("value").toFixed(this.displayPrecision_);
  if (this.unit_) {
    displayValue += " " + this.unit_;
  }
  this.$valueField_.val(displayValue);
};
synth.html.AnalogRotaryControl.prototype.setEditable = function (editable) {
  this.editable_ = editable;
  //var onFocus = function(e) {
		//this.$valueField_.removeClass("synth-input-camouflage");
	//}.bind(this);
	if (this.editable_) {
		this.$valueField_.attr("disabled", false);
		//this.$valueField_.on("focus", onFocus);
		this.$valueField_.on("blur", function(e) {
			//this.$valueField_.addClass("synth-input-camouflage");
      var input = parseFloat(this.$valueField_.val());
      if (!_.isNaN(input)) {
        this.set("value", input);
      }
	 	}.bind(this));
		this.$valueField_.on("keydown", function(e) {
			if(e.which === 13) { // enter
				this.$valueField_.blur();
			} else if (e.which === 27) { // escape
				this.updateValueFromPosition();
				this.$valueField_.blur();
			}
		}.bind(this));
	} else {
		this.$valueField_.attr("disabled", true);
		//this.$valueField_.off("focus", onFocus);
	}
};
synth.html.AnalogRotaryControl.prototype.updateValueFromPosition = function () {
  this.set("value", this.mappingFunction_(this.get("position")));
};
synth.html.AnalogRotaryControl.prototype.updatePositionFromValue = function () {
  //console.log(this.inverseMappingFunction_(this.get("value")));
  this.set("position", this.shorten(this.inverseMappingFunction_(this.get("value"))));
};


/**
 * DiscreteRotaryControl
 * @class
 *
 *
 */
// TODO: Use setters, getters from ChangeFiring
synth.html.DiscreteRotaryControl = function(opt_options) {
  opt_options = opt_options || {};
  this.valueIndex_ = 0;
  opt_options.values = opt_options.values || [0, 1];
  opt_options.initial = opt_options.initial || opt_options.values[0];
  synth.html.RotaryControl.call(this, opt_options);
  this.setValueArray(opt_options.values);
  this.updatePositionFromValue();
};
synth.inherits(synth.html.DiscreteRotaryControl, synth.html.RotaryControl);
synth.html.DiscreteRotaryControl.prototype.setValueArray = function (valueArray) {
  this.length_ = valueArray.length;
  this.values_ = valueArray;
  this.dots_ = [];
  for(var i=0; i<this.length_; i++) {
    this.dots_.push(1/(this.length_-1)*i);
  }
  this.createDots_();
  //this.updateValueFromPosition();
};
synth.html.DiscreteRotaryControl.prototype.updateValueFromPosition = function () {
  if (this.values_) {
    var findNearest = function (start, end) {
      if (end-start > 1) {
        var middle = start + Math.floor((end-start)/2);
        if (this.get("position") <= this.dots_[middle]) {
          return findNearest(start, middle);
        } else {
          return findNearest(middle, end);
        }
      } else if (end-start === 1) {
        if (this.get("position") - this.dots_[start] < this.dots_[end] - this.get("position")) {
          return start;
        } else {
          return end;
        }
      } else {
         return start;
      }
    }.bind(this);
    this.valueIndex_ = findNearest(0, this.length_-1);
    this.set("value", this.values_[this.valueIndex_]);
    this.$valueField_.val(this.get("value"));
  }
};
synth.html.DiscreteRotaryControl.prototype.updatePositionFromValue = function () {
  if (!this.mouseMove_) {
    this.valueIndex_ = this.values_.indexOf(this.get("value"));
    this.set("position", this.shorten(this.dots_[this.valueIndex_]));
  }
};
synth.html.DiscreteRotaryControl.prototype.onDocMouseUp_ = function (e) {
  if (this.mouseMove_) {
    this.set("position", this.shorten(this.dots_[this.valueIndex_]));
  }
  synth.html.RotaryControl.prototype.onDocMouseUp_.call(this, e);
};


synth.controller = synth.controller || {};

synth.controller.Controller = function (opt_options) {

	opt_options = opt_options || {};

	this.$element_ = opt_options.$element || $("<div>").addClass(this.className_);

	if ("$target" in opt_options) {
		opt_options.$target.append(this.$element_);
	}
};

synth.controller.Controller.prototype.get$Element = function () {
	return this.$element_;
};

synth.controller.Controller.prototype.set$Target = function ($target) {
	$target.append(this.$element_);
};








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
  this.registerEventType("interrupt");

	this.audioContext_ = audioContext;

	this.bpm_ = 120;

	this.minBpm_ = 20;
	this.maxBpm_ = 360;

	this.lookahead_ = 0.5; // the time between the nextBar event and the actual time of the nextBar

	/**
	 * @property started {boolean} whether the clock is started or not
	 */
	this.started = false;

	this.nextBar_ = 0;
	this.nextBarTime_ = 0;

};
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

  if (bpm !== this.bpm_) {
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
  }
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
 * Stops the clock and sends an interrupt signal immediately
 * @method
 */
synth.Clock.prototype.interrupt = function () {
		this.stop(this.audioContext_.currentTime);
		/**
		 * interrupt Event
		 * @event interrupt
		 */
		this.fireEvent("interrupt");
};

/**
 * This method creates a self adjusting loop which fires the nextBar event
 * @private
 * @method
 */
synth.Clock.prototype.makeLoop_ = function () {
	clearTimeout(this.loopTimeout);

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
		this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.lookahead_) * 1000);
	}.bind(this);

	this.loopTimeout = setTimeout(loop, (this.nextBarTime_ - this.audioContext_.currentTime - this.lookahead_) * 1000);
};

synth.Clock.prototype.currentTime = function () {
  return this.audioContext_.currentTime;
};


synth.controller.TempoTap = function (clock, opt_options) {
	opt_options = opt_options || {};
	this.clock = clock;
	this.className_ = opt_options.className || "synth-tempotap";
  this.classNameActive_ = "synth-active";
  this.taps_ = opt_options.taps || 4;
  var counter = 0;
  var times = [];
  var lastTime;
  var $tapButton = $("<button>").addClass(this.className_);
  var setText = function() {
    $tapButton.text("TAP (" + (this.taps_-counter) + "x)");
  }.bind(this);
  setText();
  $tapButton.on("click", function () {
    counter++;
    var now = Date.now();
    if (counter > 1) {
      times.push(now-lastTime);
    }
    lastTime = now;
    if (counter == 1) {
      $tapButton.addClass(this.classNameActive_);
    } else if (counter == this.taps_) {
      //var avg = _.sum(times)/(this.taps_-1);
      var avg = _.reduce(times, function(tot, n) { return tot + n; })/(this.taps_-1);
      clock.setBpM(60000 / avg);
      times = [];
      counter = 0;
      $tapButton.removeClass(this.classNameActive_);
    }
    setText();
	}.bind(this));
  opt_options.$element = $tapButton;
  synth.controller.Controller.call(this, opt_options);
};
synth.inherits(synth.controller.TempoTap, synth.controller.Controller);






synth.html = synth.html || {};

synth.html.NumberInputField = function (opt_options) {
  opt_options = opt_options || {};

	synth.Observable.call(this);

  this.displayPrecision_ = opt_options.displayPrecision || 2;

	this.registerEventType("input");

	this.$element_ = $("<input>");
  this.setValue(opt_options.initial || 0);

	var valueBeforeEdit = null;

	var onFocus = function (e) {
		valueBeforeEdit = this.$element_.val();
	}.bind(this);

	var onBlur = function (e) {
    this.setValue(parseFloat(this.$element_.val()));
	}.bind(this);

	var onKeydown = function (e) {
		if(e.which === 13) { // enter
			this.$element_.blur();
		} else if (e.which === 27) { // escape
			this.$element_.val(valueBeforeEdit);
			this.$element_.blur();
		}
	}.bind(this);

	this.$element_.on("focus", onFocus);
	this.$element_.on("blur", onBlur);
	this.$element_.on("keydown", onKeydown);
};
synth.inherits(synth.html.NumberInputField, synth.Observable);

synth.html.NumberInputField.prototype.get$Element = function () {
	return this.$element_;
};

synth.html.NumberInputField.prototype.setValue = function (value) {
  var oldValue = this.value_;
  this.value_ = value;
	this.$element_.val(value.toFixed(this.displayPrecision_));
  this.fireEvent("input", [{oldValue: oldValue, newValue: value}]);
};

synth.html.NumberInputField.prototype.getValue = function () {
	return this.value_;
};



synth.html.NumberInputFieldWithValueDrag = function (opt_options) {
  opt_options = opt_options || {};

	synth.html.NumberInputField.call(this, opt_options);

	this.resolution_ = opt_options.resolution || 1;

	var drag = false;
	var lastY = null;
	//var lastTime = null;
	//var interval = null;

	//var positionY = 0;

	// var updateValue = function () {
		// var now = Date.now();
		// var distance = positionY - lastY;
		// var time = now - lastTime;

		// //distance is the velocity of the change
		// // newValue = oldValue + v/t * factor
		// this.$element_.val(parseFloat(this.$element_.val()) + distance/time * this.resolution_);
		// this.fireEvent("input");

		// lastTime = now;
	// }.bind(this);

  this.$element_.addClass("synth-input-camouflage");

	var onMouseDown = function (e) {
		drag = true;
		lastY = e.pageY;

		//positionY = this.$element_.offset().top + this.$element_.height() * 0.5;

		//interval = setInterval(updateValue, 50);
	}.bind(this);

	var onMouseMove = function (e) {
		if(drag) {
			var distance = lastY - e.pageY;

			this.setValue(parseFloat(this.$element_.val()) + distance * this.resolution_);

			lastY = e.pageY;
		}
	}.bind(this);

	var onMouseUp = function (e) {
		if(drag) {
			drag = false;
			//clearInterval(interval);
		}
	};

	this.$element_.on("mousedown", onMouseDown);
	$(document).on("mousemove", onMouseMove);
	$(document).on("mouseup", onMouseUp);

	this.$element_.on("touchstart", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		onMouseDown(e);
	});
	this.$element_.on("touchmove", function (e) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
		onMouseMove(e);
	});
	this.$element_.on("touchend", onMouseUp);
};
synth.inherits(synth.html.NumberInputFieldWithValueDrag, synth.html.NumberInputField);



synth.svgs = synth.svgs || {};

synth.svgs.play = '<svg viewBox = "0 0 100 100" version = "1.1" class="synth-svg-play"><path d = "M 25 0 L 25 100 L 75 50 L 25 0"></svg>';

synth.svgs.stop = '<svg viewBox = "0 0 100 100" version = "1.1" class="synth-svg-stop"><path d = "M 10 10 L 90 10 L 90 90 L 10 90 L 10 10"></svg>';


synth.controller.Playback = function (audioContext, opt_options) {

	opt_options = opt_options || {};

	this.clock = new synth.Clock(audioContext, opt_options.clockOptions);

	this.className_ = opt_options.className || "synth-playback";
  this.classNameActive_ = "synth-active";

	synth.controller.Controller.call(this, opt_options);

  var $playButton, $stopButton, $bpmDiv;

  // PLAYBUTTON
	$playButton = $("<button>").addClass(this.className_ + "-play").append(synth.svgs.play);
	$playButton.on("click", function () {
    if(!this.clock.started) {
		  this.clock.start();
    }
	}.bind(this));
	this.$element_.append($playButton);

  this.clock.on("start", function () {
    $playButton.addClass(this.classNameActive_);
    $stopButton.removeClass(this.classNameActive_);
    //this.running_ = true;
  }.bind(this));

  //STOPBUTTON
	$stopButton = $("<button>").addClass(this.className_ + "-stop").append(synth.svgs.stop);
  $stopButton.addClass(this.classNameActive_);
	$stopButton.on("click", function () {
    if (this.clock.started) {
		  this.clock.stop();
    } else {
      this.clock.interrupt();
    }
	}.bind(this));
	this.$element_.append($stopButton);

  this.clock.on("stop", function () {
    $stopButton.addClass(this.classNameActive_);
    $playButton.removeClass(this.classNameActive_);
  }.bind(this));

  // KEYBOARD CONTROLS

  $(document).on("keydown", function (e) {
    if (e.which === 32) { //space
      // TOGLE PLAY/PAUSE
      if (!this.clock.started) {
        this.clock.start();
      } else {
        this.clock.stop();
      }
      e.preventDefault();
    } else if (e.which === 27) { //esc
      this.clock.interrupt();
    }
  }.bind(this));

  //BPM

	$bpmDiv = $("<div>").addClass(this.className_ + "-bpm");
  var bpmField = new synth.html.NumberInputFieldWithValueDrag({resolution: 0.7, displayPrecision: 2});
	bpmField.setValue(this.clock.getBpM());

	bpmField.on("input", function () {
		this.clock.setBpM(parseFloat(bpmField.getValue()));
	}.bind(this));

  this.clock.on("tempoChange", function () {
    bpmField.setValue(this.clock.getBpM());
  }.bind(this));

  // TEMPOTAP

  this.tempoTap = new synth.controller.TempoTap(this.clock);
  this.$element_.append(this.tempoTap.get$Element());

	$bpmDiv.append(bpmField.get$Element()).append("BpM");
	this.$element_.append($bpmDiv);
};
synth.inherits(synth.controller.Playback, synth.controller.Controller);





/*
 * The StateExchangable class defines the abstract methods getState and setState which are used for example by the storage controller.
 */
synth.StateExchangable = function () {
};
synth.StateExchangable.prototype.getState = function () {
  return {};
};
synth.StateExchangable.prototype.setState = function (state) {
};


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



synth.scales = {};

(function () {

  // i calculate frequencies from note c0 to b8
  // the given index and frequency specifies the frequency of the specified note, all others are caluculated accordingly
  var calculateFrequencies = function (index, frequency) {

    var frequencies = [];
    var number = 12 * 9;
    var a = Math.pow(2, 1/12);

    for (var i=0; i<number; i++) {
      frequencies.push(frequency*Math.pow(a, i-index));
    }

    return frequencies;
  };

  synth.scales.getIndexOf = function (step, intervals, baseNoteIndex) {
    var octaveLength = intervals.reduce( function (prev, cur) { return prev+cur; } );
    var octaveModifier = Math.floor(step/octaveLength);
    return intervals.slice(0, step % intervals.length).reduce( function (prev, cur) { return prev+cur; }, baseNoteIndex + octaveModifier * octaveLength );
  };

  synth.scales.intervals = {};
  synth.scales.intervals.major = [2,2,1,2,2,2,1];
  synth.scales.intervals.minor = [2,1,2,2,1,2,2];
  synth.scales.intervals.minorGypsy = [2,1,3,2,1,3,1];
  synth.scales.intervals.majorGypsy = [1,3,1,2,1,3,2];
  synth.scales.intervals.bluesMinor = [3,2,1,1,3,2];
  synth.scales.intervals.bluesMajor = [2,1,1,3,2,1,2];
  //synth.scales.intervals.rockNRoll = [2,1,1,1,1,1,2,1,2];

  synth.scales.frequencyTables = {}
  synth.scales.frequencyTables.a4is432Hz = calculateFrequencies( 57, 432 );
  synth.scales.frequencyTables.a4is434Hz = calculateFrequencies( 57, 434 );
  synth.scales.frequencyTables.a4is436Hz = calculateFrequencies( 57, 436 );
  synth.scales.frequencyTables.a4is437Hz = calculateFrequencies( 57, 438 );
  synth.scales.frequencyTables.a4is440Hz = calculateFrequencies( 57, 440 );
  synth.scales.frequencyTables.a4is442Hz = calculateFrequencies( 57, 442 );
  synth.scales.frequencyTables.a4is444Hz = calculateFrequencies( 57, 444 );
  synth.scales.frequencyTables.a4is446Hz = calculateFrequencies( 57, 446 );

})();



synth.player.OneBarStepSequencer = function (clock, opt_options) {
	synth.player.Player.call(this);

	this.clock_ = clock;

	this.steps_ = opt_options.steps || 4;

  this.baseNoteIndex_ = opt_options.baseNoteIndex || 48; // C3

  //this.startingNoteIndex_ = opt_options.startingNoteIndex || 0;

  this.intervals_ = opt_options.intervals || synth.scales.intervals.major;

	this.notes_ = []; // 2 dimensional
	for (var i=0; i<this.steps_; i++) {
		this.notes_.push([]);
	}

	this.stepLength_ = this.clock_.getBarLength() / this.steps_;

	this.clock_.on("tempoChange", function (multiplier) {
		this.getInstrument().changeTempo(multiplier, this.clock_.currentTime());
		this.stepLength_ *= multiplier;
	}.bind(this));

	this.nextBarTime_ = 0;

	this.clock_.on("nextBar", function (bar, when) {
		this.nextBarTime_ = when;
		this.playBar(bar, when);
	}.bind(this));

	this.clock_.on("stop", function (when) {
		this.getInstrument().pause(when);
	}.bind(this));

  this.clock_.on("interrupt", function () {
    this.getInstrument().interrupt();
  }.bind(this));

  this.registerEventType("toggleField");
};
synth.inherits(synth.player.OneBarStepSequencer, synth.player.Player);

synth.player.OneBarStepSequencer.prototype.playBar = function (bar, when) {
	for (var i=0; i<this.steps_; i++) {
		this.notes_[i].forEach(function (value) {
      var note = {
        time: when + i * this.stepLength_,
        duration: this.stepLength_,
        value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
      };
			this.getInstrument().addNote(note);
		}.bind(this));
	}
};

synth.player.OneBarStepSequencer.prototype.addNote = function (stepIndex, value) {
	this.notes_[stepIndex].push(value);

	if (this.clock_.started) {
		var timeObject = {
      time: stepIndex*this.stepLength_,
      duration: this.stepLength_,
      value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
    };
		var barLength = this.clock_.getBarLength();
		var timeCollection = new synth.TimeCollection(0, 2 * barLength);
		timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject));
		this.getInstrument().addNotes(timeCollection.timeAdd(this.nextBarTime_));
	}

  this.fireEvent("toggleField", [{ col: stepIndex, row: value }]);
};


synth.player.OneBarStepSequencer.prototype.removeNote = function (stepIndex, value) {
	var index = this.notes_[stepIndex].indexOf(value);

	if (index > -1) {
		this.notes_[stepIndex].splice(index,1);

		if (this.clock_.started) {
			var timeObject = {
        time: stepIndex*this.stepLength_,
        duration: this.stepLength_,
        value: synth.scales.getIndexOf(value, this.intervals_, this.baseNoteIndex_)
      };
			var barLength = this.clock_.getBarLength();
			var timeCollection = new synth.TimeCollection(0, 2 * barLength);
			timeCollection.insert(_.cloneDeep(timeObject)).timeAdd(-barLength).insert(_.cloneDeep(timeObject)).timeAdd(this.nextBarTime_);
			this.getInstrument().removeNotes(timeCollection);
		}
	}

  this.fireEvent("toggleField", [{ col: stepIndex, row: value }]);
};

synth.player.OneBarStepSequencer.prototype.toggleNote = function (stepIndex, value) {
  var index = this.notes_[stepIndex].indexOf(value);
  if (index > -1) {
    this.removeNote(stepIndex, value);
  } else {
    this.addNote(stepIndex, value);
  }
};

synth.player.OneBarStepSequencer.prototype.clear = function () {
	for (var i=this.steps_-1; i>=0; i--) {
    for(var j=this.notes_[i].length-1; j>=0; j--) {
      this.removeNote(i, this.notes_[i][j]);
    }
	}
};

synth.player.OneBarStepSequencer.prototype.getState = function () {
  var state = synth.player.Player.prototype.getState.call(this);
  //state.steps = this.steps_; // NOTE: this is not updatable
  state.baseNoteIndex = this.baseNoteIndex_;
  state.intervals = _.cloneDeep(this.intervals_);
  state.notes = _.cloneDeep(this.notes_);
  return state;
};

synth.player.OneBarStepSequencer.prototype.setState = function (state) {
  synth.player.Player.prototype.setState.call(this, state);
  this.baseNoteIndex_ = state.baseNoteIndex;
  this.intervals_ = state.intervals;
  this.clear();
  state.notes.forEach(function (column, index) {
    column.forEach(function (note) {
      this.addNote(index, note);
    }.bind(this));
  }.bind(this));
};


synth.controller.Sequencer = function (clock, opt_options) {

	opt_options = opt_options || {};

  opt_options.sequencerOptions = opt_options.sequencerOptions || {};
  this.cols_ = opt_options.cols || 8;
  this.rows_ = opt_options.rows || 8;
  opt_options.sequencerOptions.steps = this.cols_;

  this.player = new synth.player.OneBarStepSequencer(clock, opt_options.sequencerOptions);

	this.className_ = opt_options.className || "synth-sequencer";

	synth.controller.Controller.call(this, opt_options);

  this.storageController_ = new synth.controller.Storage({ storageKey: "sequencer", stateExchangable: this.player });

  this.$element_.append(this.storageController_.get$Element());

	this.classNameButton_ = this.className_ + "-button";
	this.classNameButtonActive_ = this.classNameButton_ + "-active";
	this.classNameRow_ = this.className_ + "-row";
	this.classNameColumn_ = this.className_ + "-column";

  var $buttonDiv = $("<div>").addClass(this.className_ + "-buttons");

  this.$buttons_ = []; // 2 dimensional

  for (var col=0; col<this.cols_; col++) {
    this.$buttons_.push([]);
    for (var row=0; row<this.rows_; row++) {
      (function (cCol, cRow) {
        var $button = $("<button>").addClass(this.classNameButton_).addClass(this.classNameColumn_ + "-" + col).addClass(this.classNameRow_ + "-" + (this.rows_-row-1));
				$button.on("click", function () {
				  this.player.toggleNote(cCol, cRow);
				}.bind(this));
				$buttonDiv.append($button);
        this.$buttons_[col].push($button);
      }.bind(this))(col, row);
    }
  }

  this.player.on("toggleField", function (e) {
    this.$buttons_[e.col][e.row].toggleClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($buttonDiv);

  var $clearButton = $("<button>").addClass(this.className_ + "-clear").text("Clear").on("click", function () {
    this.player.clear();
    $buttonDiv.children().removeClass(this.classNameButtonActive_);
  }.bind(this));

  this.$element_.append($("<div>").addClass(this.className_ + "-clear").append($clearButton));
};
synth.inherits(synth.controller.Sequencer, synth.controller.Controller);







synth.Connectable = function () {
  this.input = null;
  this.output = null;
};
synth.Connectable.prototype.connect = function (connectable) {
  if(connectable.hasOwnProperty("input")) {
    this.connect(connectable.input);
  } else {
    this.output.connect(connectable);
  }
};



synth.instrument = synth.instrument || {};

/**
 * This is the base class for all instruments, providing a common interface.
 * All base classes only need to listen for inserts and removes on the frequenciesToPlay TimeCollection property to get informed aboput all new frequencies
 * @class
 */
// NOTE: At the moment instrument doesn't support live playing of a note
synth.instrument.Instrument = function (audioContext, opt_options) {
	synth.StateExchangable.call(this);
  synth.Connectable.call(this);

  opt_options = opt_options || {};

	this.audioContext_ = audioContext;

	this.frequenciesToPlay = new synth.TimeCollection(0, 0); // May not be overriden! NOTE: maybe using a defineProperty here?

	//this.addExchangeObjectStateParameter("scale", this.getScale, this.setScale);
  if (opt_options.frequencyTableName) {
    this.frequencyTableName_ = opt_options.frequencyTableName;
  } else {
    this.frequencyTableName_ = "a4is440Hz";
  }
  this.frequencyTable_ = synth.scales.frequencyTables[this.frequencyTableName_];
};
synth.inherits(synth.instrument.Instrument, synth.StateExchangable);
synth.inherits(synth.instrument.Instrument, synth.Connectable);

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.addFrequency = function (timeObject) {
	this.frequenciesToPlay.insert(timeObject);

	var curTime = this.audioContext_.currentTime;
	this.frequenciesToPlay.before(curTime, false).forEach(function (timeObject) {
		if (timeObject.time + timeObject.duration < curTime) {
			this.frequenciesToPlay.remove(timeObject);
		}
	}.bind(this));
};


synth.instrument.Instrument.prototype.addFrequencies = function (frequencyTimeCollection) {
	frequencyTimeCollection.forEach(function (timeObject) {
		this.addFrequency(timeObject);
	}.bind(this));
};


synth.instrument.Instrument.prototype.addNote = function (timeObject) {
	var newTimeObject = _.cloneDeep(timeObject);
	newTimeObject.value = this.frequencyTable_[timeObject.value];
	this.addFrequency(newTimeObject);
};

synth.instrument.Instrument.prototype.addNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.addNote(timeObject)
	}.bind(this));
};


/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.removeFrequency = function (timeObject) {
	this.frequenciesToPlay.remove(timeObject);
};

synth.instrument.Instrument.prototype.removeFrequencies = function (frequencyTimeCollection) {
	frequencyTimeCollection.forEach(function (timeObject) {
		this.removeFrequency(timeObject);
	}.bind(this));
};

synth.instrument.Instrument.prototype.removeNote = function (timeObject) {
	var newTimeObject = _.cloneDeep(timeObject);
	timeObject.value = this.frequencyTable_[timeObject.value];
	this.removeFrequency(timeObject);
};

synth.instrument.Instrument.prototype.removeNotes = function (noteTimeCollection) {
	noteTimeCollection.forEach(function (timeObject) {
		this.removeNote(timeObject);
	}.bind(this));
};

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.changeTempo = function (tempoMultiplier, when) {

  // notes which already started at the time of the tempo change only need to be changed in length
  this.frequenciesToPlay.atTime(when).forEach(function (timeObject) {
    var modifiedPart = (timeObject.time + timeObject.duration - when) * tempoMultiplier;
    var originalPart = when - timeObject.time;
    timeObject.duration = originalPart + modifiedPart;
  });

  // notes which start afterwards need to be changed both in time and duration
	this.frequenciesToPlay.after(when, false).forEach(function (timeObject) {
    //var old = _.cloneDeep(timeObject);
		timeObject.time = (timeObject.time - when) * tempoMultiplier + when;
		timeObject.duration *= tempoMultiplier;
    //this.frequenciesToPlay.fireEvent("objectChanged",[{old: old, new: timeObject}]);
	}.bind(this));
};

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.interrupt = synth.abstractFunction;

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.pause = synth.abstractFunction;

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.getState = function () {
  var state = synth.StateExchangable.prototype.getState.call(this);
  state.frequencyTableName = this.frequencyTableName_;
  return state;
};

/**
 *
 * @method
 */
synth.instrument.Instrument.prototype.setState = function (state) {
  synth.StateExchangable.prototype.setState.call(this, state);
  this.frequencyTableName_ = state.frequencyTableName;
  this.frequencyTable_ = synth.scales.frequencyTables[this.frequencyTableName_];
};




/*
 * The ModularSynth is an Instrument which consists of different not predefined modules. They can be added with the addModule method.
 * If a module has a watch method, the module gets informed about new notes to be played.
 * The modules need to be connected manually outside the modular synth.
 * Important: The module the output comes from needs to be set with the setOutputModule method.
 */

synth.instrument.ModularSynth = function (audioContext, opt_options) {

  opt_options = opt_options || {};

	//synth.StateExchange.call(this);

  synth.instrument.Instrument.call(this, audioContext, opt_options);

  this.modules_ = [];

};
synth.inherits(synth.instrument.ModularSynth, synth.instrument.Instrument);

synth.instrument.ModularSynth.prototype.addModule = function (aModule) {
  this.modules_.push(aModule);
  if(aModule.listen) {
    aModule.listen(this.frequenciesToPlay);
  }
};

synth.instrument.ModularSynth.prototype.setOutputModule = function (aModule) {
  this.addModule(aModule);
  this.output = aModule;
};

synth.instrument.ModularSynth.prototype.pause = function (when) {
  this.modules_.forEach(function (aModule) {
    if(aModule.pause) {
      aModule.pause(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.interrupt = function () {
  this.modules_.forEach(function (aModule) {
    if(aModule.interrupt) {
      aModule.interrupt();
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.changeTempo = function (tempoMultiplier, when) {
  synth.instrument.Instrument.prototype.changeTempo.call(this, tempoMultiplier, when);

  this.modules_.forEach(function (aModule) {
    if(aModule.updateTiming) {
      aModule.updateTiming(when);
    }
  }.bind(this));
};

synth.instrument.ModularSynth.prototype.getState = function () {
  var state = synth.instrument.Instrument.prototype.getState.call(this);
  state.modules = [];
  this.modules_.forEach(function (aModule) {
    state.modules.push(aModule.getState());
  });
  return state;
};

synth.instrument.ModularSynth.prototype.setState = function (state) {
  synth.instrument.Instrument.prototype.setState.call(this, state);
  state.modules.forEach(function (aModuleState, index) {
    if (this.modules_[index]) {
      this.modules_[index].setState(aModuleState);
    }
  }.bind(this));
};











synth = synth || {};
synth.module = synth.module || {};

synth.module.Module = function (audioContext) {
  synth.Connectable.call(this);
  synth.StateExchangable.call(this);
  synth.ChangeFiring.call(this);

  this.audioContext_ = audioContext;
};
synth.inherits(synth.module.Module, synth.Connectable);
synth.inherits(synth.module.Module, synth.StateExchangable);
synth.inherits(synth.module.Module, synth.ChangeFiring);




(function () {

  /*
   * The module Soundgenerator can produce sounds in different frequencies, wavetypes, lengths and with a defined envelope shape.
   * The tempo can be changed after notes where send to play.
   * To achieve this the Soundgenerator creates a SingleSoundGenerator for every sound it plays.
   * If the tempo, the wavetype or the envelope shape gets changed every SingleSoundGenerator gets updated
   */

  var SoundState = {
    PLANNED: 0,
    RUNNING: 1,
    FINISHED: 2
    //STARTED: 1,
    //SUSTAINED: 2,
    //ENDING: 3,
    //ENDED: 4
  };

  synth.module.SoundGenerator = function (audioContext, opt_options) {
    synth.module.Module.call(this, audioContext);

    opt_options = opt_options || {};
    opt_options.envelope = opt_options.envelope || {};

    this.gain_ = audioContext.createGain();

    this.sounds_ = [];

    this.output = this.gain_;

    this.set("waveType", opt_options.waveType || "sine");
    this.set("gain", opt_options.gain || 1);
    this.set("attack", opt_options.envelope.attack || 0);
    this.set("decay", opt_options.envelope.decay || 0);
    this.set("sustain", opt_options.envelope.sustain || 1);
    this.set("release", opt_options.envelope.release || 0);

    this.on("change:waveType", this.onWaveTypeChange);
    this.on("change:gain", this.onGainChange);
    this.on("change:attack", this.updateTiming);
    this.on("change:decay", this.updateTiming);
    this.on("change:sustain", this.updateTiming);
    this.on("change:release", this.updateTiming);
  };
  synth.inherits(synth.module.SoundGenerator, synth.module.Module);

  synth.module.SoundGenerator.prototype.disposeEndedSounds_ = function () {
    for(var i=this.sounds_.length-1; i >= 0; i--) {
      if(this.sounds_[i].getSoundState() >= SoundState.FINISHED) {
        this.sounds_.splice(i,1)[0].dispose();
      }
    }
  };

  synth.module.SoundGenerator.prototype.listen = function (collection) {

    collection.on("insert", function (timeObject) {
      console.log("new sound at %s", timeObject.time);
      var newSound = new Sound(
        this.audioContext_,
        timeObject,
        this.get("waveType"),
        {
          attack: this.get("attack"),
          decay: this.get("decay"),
          sustain: this.get("sustain"),
          release: this.get("release")
        });
      this.sounds_.push(newSound);
      newSound.connect(this.gain_);
      this.disposeEndedSounds_();
    }.bind(this));

    collection.on("remove", function (timeObject) {
      for(var i=this.sounds_.length-1, found=false; i >= 0 && !found; i--) {
        if(helpers.timeObjectsEqual(this.sounds_[i].timeObject, timeObject)) {
          found = true;
          var sound = this.sounds_[i];
          if (sound.getSoundState() <= SoundState.PLANNED) {
            this.sounds_.splice(i, 1);
            sound.interrupt();
          }
        }
      }
      this.disposeEndedSounds_();
    }.bind(this));
  };

  synth.module.SoundGenerator.prototype.pause = function (when) {
    // pause doesn't support continuation at the moment
    when = when || 0;
    this.sounds_.forEach(function (sound) {
      if (sound.getSoundState() <= SoundState.PLANNED) {
        sound.interrupt();
      }
    });
    this.disposeEndedSounds_();
  };

  synth.module.SoundGenerator.prototype.interrupt = function () {
    this.sounds_.forEach(function (sound) {
      sound.interrupt();
      sound.dispose();
    });
    this.sounds_ = [];
  };

  synth.module.SoundGenerator.prototype.onWaveTypeChange = function (e) {
    this.disposeEndedSounds_();
    this.sounds_.forEach(function (sound) {
       sound.setWaveType(e.newValue);
    });
  };

  synth.module.SoundGenerator.prototype.onGainChange = function (e) {
    this.gain_.gain.value = e.newValue;
  };

  synth.module.SoundGenerator.prototype.updateTiming = function () {
    this.sounds_.forEach(function (sound) {
      if (sound.getSoundState() <= SoundState.PLANNED) {
        sound.envelope = {
          attack: this.get("attack"),
          decay: this.get("decay"),
          sustain: this.get("sustain"),
          release: this.get("release")
        };
        sound.shape();
      }
    }.bind(this));
    this.disposeEndedSounds_();
  };

  synth.module.SoundGenerator.prototype.getState = function () {
    var state = synth.module.Module.prototype.getState.call(this);
    state.waveType = this.get("waveType");
    state.gain = this.get("gain");
    state.attack = this.get("attack");
    state.decay = this.get("decay");
    state.sustain = this.get("sustain");
    state.release = this.get("release");
    return state;
  };

  synth.module.SoundGenerator.prototype.setState = function (state) {
    synth.module.Module.prototype.setState.call(this, state);
    this.set("waveType", state.waveType);
    this.set("gain", state.gain);
    this.set("attack", state.attack);
    this.set("decay", state.decay);
    this.set("sustain", state.sustain);
    this.set("release", state.release);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var Sound = function (audioContext, timeObject, waveType, envelope) {
    this.audioContext_ = audioContext;

    this.timeObject = timeObject;
    this.envelope = envelope || { attack: 0, decay: 0, sustain: 1, release: 0 };

    this.envelopeShaper_ = audioContext.createGain();
    this.envelopeShaper_.gain.value = 0;

    this.oscillator_ = this.audioContext_.createOscillator();
    this.oscillator_.frequency.value = this.timeObject.value;
    this.oscillator_.type = waveType || "sine";
    this.oscillator_.start(0);

    this.oscillator_.connect(this.envelopeShaper_);
    this.shape();

    //envelope (implemented with a gain node)

    this.output = this.envelopeShaper_;
  };
  synth.inherits(Sound, synth.module.Module);

  Sound.prototype.shape = function () {
    var currentTime = this.audioContext_.currentTime;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    this.attackTime_ = this.timeObject.time;
    this.decayTime_ = this.attackTime_ + this.envelope.attack;
    this.sustainTime_ = this.decayTime_ + this.envelope.decay;
    this.releaseTime_ = this.timeObject.time + this.timeObject.duration;


    if (this.envelope.attack === 0) {
      this.envelopeShaper_.gain.setValueAtTime(1, this.attackTime_);
    } else {
      this.envelopeShaper_.gain.setValueAtTime(0, this.attackTime_);

      if (this.envelope.attack < this.timeObject.duration) {
        this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.decayTime_);

        if (this.envelope.decay !== 0) {
          if (this.envelope.attack + this.envelope.decay < this.timeObject.duration) {
            this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain, this.sustainTime_);

            this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.releaseTime_);

          } else {
            var part = this.envelope.decay / (this.timeObject.duration - this.envelope.attack);
            this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain * part, this.releaseTime_);
          }
        } else {
          this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.decayTime_);
          this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.releaseTime_);
        }

      } else {
        var part = this.envelope.attack / this.timeObject.duration;
        this.envelopeShaper_.gain.linearRampToValueAtTime(part, this.releaseTime_);
      }
    }

    this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.releaseTime_ + this.envelope.release);
  };

/*  Sound.prototype.start = function () {

    var currentTime = this.audioContext_.currentTime;
    var nominalEndTime = this.timeObject.time + this.timeObject.duration;

    this.envelopeShaper_.gain.cancelScheduledValues(currentTime);

    this.startTime_ = this.timeObject.time;
    this.sustainTime_ = Math.min(this.startTime_ + this.envelope.attack + this.envelope.decay, nominalEndTime);

    this.valueAtRelease_ = this.envelope.sustain;

    // Note start
    if (this.envelope.attack !== 0) {
      this.envelopeShaper_.gain.setValueAtTime(0, this.startTime_);
      //console.log("start: 0 at %s", this.startTime_); //DEBUG
      console.log("start: 0 at 0"); //DEBUG
    } else if (this.envelope.attack === 0 && this.envelope.decay !== 0) {
      this.envelopeShaper_.gain.setValueAtTime(1, this.startTime_);
      //console.log("start: 1 at %s", this.startTime_); //DEBUG
      console.log("start: 1 at 0"); //DEBUG
    } else if (this.envelope.attack === 0 && this.envelope.decay === 0) {
      this.envelopeShaper_.gain.setValueAtTime(this.envelope.sustain, this.startTime_);
      //console.log("start: %s at %s", this.envelope.sustain, this.startTime_); //DEBUG
      console.log("start: %s at 0", this.envelope.sustain); //DEBUG
    }

    // Attack
    if (this.envelope.attack !== 0) {
      // is the note longer than the attack time?
      if (this.timeObject.duration > this.envelope.attack) {
        this.envelopeShaper_.gain.linearRampToValueAtTime(1, this.startTime_ + this.envelope.attack);
        //console.log("attack: linear Ramp to %s at %s", 1, this.startTime_ + this.envelope.attack); //DEBUG
        console.log("attack: linear Ramp to %s at %s", 1, this.envelope.attack); //DEBUG
      } else {
        var part = this.envelope.attack / this.timeObject.duration;
        this.envelopeShaper_.gain.linearRampToValueAtTime(part, nominalEndTime);
        this.valueAtRelease_ = part;
        //console.log("attack: linear Ramp to %s at %s", part, this.startTime_ + this.envelope.attack); //DEBUG
        console.log("attack: linear Ramp to %s at %s", part, this.envelope.attack); //DEBUG
      }
    }

    if(this.envelope.decay !== 0 && this.timeObject.duration > this.envelope.attackh) {
      // Decay
      // is note longer than attack time plus decay time?
        if (this.timeObject.duration > this.envelope.attack + this.envelope.decay) {
          this.envelopeShaper_.gain.linearRampToValueAtTime(this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay);
          //console.log("decay: linear Ramp to %s at %s", this.envelope.sustain, this.startTime_ + this.envelope.attack + this.envelope.decay); //DEBUG
          console.log("decay: linear Ramp to %s at %s", this.envelope.sustain, this.envelope.attack + this.envelope.decay); //DEBUG
        } else {
          var part = this.envelope.decay / (this.timeObject.duration - this.envelope.attack);
          this.envelopeShaper_.gain.linearRampToValueAtTime(part * this.envelope.sustain, nominalEndTime);
          this.valueAtRelease_ = part * this.envelope.sustain;
          //console.log("decay: linear Ramp to %s at %s", part * this.envelope.sustain, nominalEndTime); //DEBUG
          console.log("decay: linear Ramp to %s at %s", part * this.envelope.sustain, this.envelope.attack); //DEBUG
        }
    }

    this.nominalEndTime_ = nominalEndTime;
  };

  Sound.prototype.end = function (now) {
    var nominalEndTime;

    if (now) {
      nominalEndTime = this.audioContext_.currentTime;
    } else {
      nominalEndTime = Math.max(this.sustainTime_, this.timeObject.time + this.timeObject.duration);
    }

    this.realEndTime_ = nominalEndTime + this.envelope.release;

    this.envelopeShaper_.gain.cancelScheduledValues(nominalEndTime);

    if (nominalEndTime <= this.realEndTime_) {
      // Sustain end
      this.envelopeShaper_.gain.setValueAtTime(this.valueAtRelease_, nominalEndTime);
      //console.log("sustain: %s at %s", this.envelope.sustain, nominalEndTime); //DEBUG
      console.log("sustain: %s at %s", this.valueAtRelease_, nominalEndTime-this.startTime_); //DEBUG

      // Release
      this.envelopeShaper_.gain.linearRampToValueAtTime(0, this.realEndTime_);
      //console.log("release: linear Ramp to %s at %s", 0, nominalEndTime + this.envelope.release); //DEBUG
      console.log("release: linear Ramp to %s at %s", 0, this.realEndTime_ - this.startTime_); //DEBUG
    } else {
      this.envelopeShaper_.gain.setValueAtTime(0, nominalEndTime);
    }

    this.nominalEndTime_ = nominalEndTime;
  };

  Sound.prototype.getSoundState = function () {
    var currentTime = this.audioContext_.currentTime;
    if (currentTime < this.startTime_) {
      return SoundState.PLANNED;
    } else if (currentTime > this.realEndTime_) {
      return SoundState.ENDED;
    } else if (currentTime > this.nominalEndTime_) {
      return SoundState.ENDING;
    } else if (currentTime > this.sustainTime_) {
      return SoundState.SUSTAINED;
    } else {
      return SoundState.STARTED;
    }
  }; */

  Sound.prototype.getSoundState = function () {
    var currentTime = this.audioContext_.currentTime;
    if (currentTime < this.timeObject.time) {
      return SoundState.PLANNED;
    } else if (currentTime > this.releaseTime_ + this.envelope.release) {
      return SoundState.FINISHED;
    } else {
      return SoundState.RUNNING;
    }
  };

  Sound.prototype.interrupt = function () {
    this.envelopeShaper_.gain.cancelScheduledValues(0);
    this.envelopeShaper_.gain.value = 0;
  };

  Sound.prototype.setWaveType = function (waveType) {
    this.oscillator_.type = waveType;
  };

  Sound.prototype.dispose = function () {

    if (!this.disposed) {
      this.disposed = true;

      this.envelopeShaper_.gain.value = 0;

      this.oscillator_.stop(0);
      this.oscillator_.disconnect();
      this.oscillator_ = null;

      this.envelopeShaper_.gain.cancelScheduledValues(0);
      this.envelopeShaper_.disconnect();
      this.envelopeShaper_ = null;

      this.output = null;
    }
  };

})();



synth.controller.SoundGenerator = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  opt_options.soundGeneratorOptions = opt_options.soundGeneratorOptions || {};
  opt_options.soundGeneratorOptions.waveType = "sine";
  opt_options.soundGeneratorOptions.gain = 0.6;
  opt_options.soundGeneratorOptions.envelope = { attack: 0.1, decay: 0, sustain: 1, release: 0.2 };

  this.module = new synth.module.SoundGenerator(audioContext, opt_options.soundGeneratorOptions);

	this.className_ = opt_options.className || "synth-module-soundgenerator";

	synth.controller.Controller.call(this, opt_options);

  // wave form -> dropdown?

  this.waveTypeControl_ = new synth.html.DiscreteRotaryControl({ title: "Wave", values: ["sine", "square", "sawtooth", "triangle"], initial: this.module.get("waveType") });
  this.waveTypeControl_.bindProperty("value", this.module, "waveType");

  // gain

  this.gainControl_ = new synth.html.AnalogRotaryControl({ title: "Gain", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, initial: this.module.get("gain") });
  this.gainControl_.bindProperty("value", this.module, "gain");

  // attack

  this.attackControl_ = new synth.html.AnalogRotaryControl({ title: "Attack", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("attack") });
  this.attackControl_.bindProperty("value", this.module, "attack");

  // decay

  this.decayControl_ = new synth.html.AnalogRotaryControl({ title: "Decay", min: 0, max: 1, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("decay") });
  this.decayControl_.bindProperty("value", this.module, "decay");

  // sustain

  this.sustainControl_ = new synth.html.AnalogRotaryControl({ title: "Sustain", min: 0, max: 1, displayPrecision: 2, initial: this.module.get("sustain") });
  this.sustainControl_.bindProperty("value", this.module, "sustain");

  // release

  this.releaseControl_ = new synth.html.AnalogRotaryControl({ title: "Release", min: 0, max: 5, /* logarithmic: true, */ displayPrecision: 2, unit: "s", initial: this.module.get("release") });
  this.releaseControl_.bindProperty("value", this.module, "release");

  this.$element_.append(this.waveTypeControl_.get$Element());
  this.$element_.append(this.gainControl_.get$Element());
  this.$element_.append(this.attackControl_.get$Element());
  this.$element_.append(this.decayControl_.get$Element());
  this.$element_.append(this.sustainControl_.get$Element());
  this.$element_.append(this.releaseControl_.get$Element());

};
synth.inherits(synth.controller.SoundGenerator, synth.controller.Controller);






synth.module.Amount = function (audioContext, opt_options) {
  synth.module.Module.call(this, audioContext, opt_options);
  opt_options = opt_options || {};
  this.wet_ = this.audioContext_.createGain();
  this.dry_ = this.audioContext_.createGain();
  this.set("amount", opt_options.amount || 0);
  this.input = this.audioContext_.createGain();
  this.input.connect(this.dry_);
  this.output = this.audioContext_.createGain();
  this.wet_.connect(this.output);
  this.dry_.connect(this.output);
  this.on("change:amount", this.onAmountChange);
};
synth.inherits(synth.module.Amount, synth.module.Module);
synth.module.Amount.prototype.biConnectWetChain = function (wetChainIn, wetChainOut) {
  this.input.connect(wetChainIn);
  wetChainOut.connect(this.wet_);
};
synth.module.Amount.prototype.onAmountChange = function (e) {
  this.wet_.gain.value = e.newValue;
  this.dry_.gain.value = 1 - e.newValue;
};
synth.module.Amount.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.amount = this.get("amount");
  return state;
};
synth.module.Amount.prototype.setState = function (state) {
  synth.module.Module.prototype.getState.call(this, state);
  this.set("amount", state.amount);
};

/**
 *
 */
synth.module.PassFilter = function (audioContext, opt_options) {
  opt_options = opt_options || {};
	synth.module.Module.call(this, audioContext, opt_options);
  this.filter_ = this.audioContext_.createBiquadFilter();
  //this.filter_.frequency.value = 350;
  //this.filter_.Q.value = 1;
  this.amount_ = new synth.module.Amount(this.audioContext_, { amount:0 });
  this.amount_.biConnectWetChain(this.filter_, this.filter_);
  this.input = this.output = this.amount_;
  this.set("type", this.filter_.type);
  this.set("frequency", this.filter_.frequency.value);
  this.set("resonance", this.filter_.Q.value);
  this.set("amount", 0);
  this.on("change:type", this.onTypeChange);
  this.on("change:frequency", this.onFrequencyChange);
  this.on("change:resonance", this.onResonanceChange);
  this.on("change:amount", this.onAmountChange);
};
synth.inherits(synth.module.PassFilter, synth.module.Module);
/* Type is either "lowpass", "highpass" or "bandpass" */
synth.module.PassFilter.prototype.onTypeChange = function (e) {
  this.filter_.type = e.newValue;
};
synth.module.PassFilter.prototype.onFrequencyChange = function (e) {
  this.filter_.frequency.value = e.newValue;
};
synth.module.PassFilter.prototype.onResonanceChange = function (e) {
  this.filter_.Q.value = e.newValue;
};
synth.module.PassFilter.prototype.onAmountChange = function (e) {
  this.amount_.set("amount", e.newValue);
};
synth.module.PassFilter.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.type = this.get("type");
  state.frequency = this.get("frequency");
  state.resonance = this.get("resonance");
  state.amount = this.get("amount");
  return state;
};
synth.module.PassFilter.prototype.setState = function (state) {
  synth.module.Module.prototype.setState.call(this, state);
  this.set("type", state.type);
  this.set("frequency", state.frequency);
  this.set("resonance", state.resonance);
  this.set("amount", state.amount);
};




// Amount

synth.controller.PassFilter = function (audioContext, opt_options) {

  opt_options = opt_options || {};

	this.module = new synth.module.PassFilter(audioContext, opt_options.passFilterOptions);

	this.className_ = opt_options.className || "synth-module-passfilter";

	synth.controller.Controller.call(this, opt_options);

  // type

  var typeControl = new synth.html.DiscreteRotaryControl({ title: "Type", values: ["lowpass", "highpass", "bandpass"], initial: this.module.get("type") });
  typeControl.bindProperty("value", this.module, "type");

  // frequency

  var freqControl = new synth.html.AnalogRotaryControl({ title: "Cutoff", min: 50, max: 1000, displayPrecision: 2, initial: this.module.get("frequency") });
  freqControl.bindProperty("value", this.module, "frequency");

  // resonance (Q)

  var resoControl = new synth.html.AnalogRotaryControl({ title: "Q", min: 0, max: 50, /* logarithmic: true, */ displayPrecision: 2, initial: this.module.get("resonance") });
  resoControl.bindProperty("value", this.module, "resonance");

  // Amount

  var amountControl = new synth.html.AnalogRotaryControl({ title: "Amount", min: 0, max: 1, displayPrecision: 2, initial: this.module.get("amount") });
  amountControl.bindProperty("value", this.module, "amount");

  this.$element_.append(typeControl.get$Element());
  this.$element_.append(freqControl.get$Element());
  this.$element_.append(resoControl.get$Element());
  this.$element_.append(amountControl.get$Element());
};
synth.inherits(synth.controller.PassFilter, synth.controller.Controller);









/**
 *
 */

synth.module.Gain = function (audioContext, opt_options) {
  opt_options = opt_options || {};

	synth.module.Module.call(this, audioContext, opt_options);

  this.gainNode_ = audioContext.createGain();

  this.set("gain", opt_options.gain || 1);

  this.input = this.output = this.gainNode_;

  this.on("change:gain", function (e) {
    this.gainNode_.gain.value = e.newValue;
  }.bind(this));
};
synth.inherits(synth.module.Gain, synth.module.Module);


synth.module.Gain.prototype.getState = function () {
  var state = synth.module.Module.prototype.getState.call(this);
  state.gain = this.get("gain");
  return state;
};

synth.module.Gain.prototype.setState = function (state) {
  synth.module.Module.prototype.getState.call(this, state);
  this.set("gain", state.gain);
};


synth.controller.Gain = function (audioContext, opt_options) {

	opt_options = opt_options || {};

  this.module = new synth.module.Gain(audioContext, opt_options.gainOptions);

	this.className_ = opt_options.className || "synth-module-gain";

	synth.controller.Controller.call(this, opt_options);

  // frequency

  var gainControl = new synth.html.AnalogRotaryControl({
    title: "Vol",
    //logarithmic: true,
    min: 0, max: 1,
    //interpretValueBelowAsZero: 0.00105,
    displayPrecision: 3,
    initial: 0.4
  });

  gainControl.bindProperty("value", this.module, "gain");

  this.$element_.append(gainControl.get$Element());
};
synth.inherits(synth.controller.Gain, synth.controller.Controller);




synth.Storage = {
  save: function (key, object) {
	  localStorage.setItem(key, JSON.stringify(object));
  },
  load: function (key) {
	  return JSON.parse(localStorage.getItem(key));
  }
};

synth.controller.Storage = function (opt_options) {
  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-storage";
  synth.controller.Controller.call(this);
  this.storageKey_ = opt_options.storageKey;
  this.stateExchangable_ = opt_options.stateExchangable;
  this.storedStates_ = {};
  // create DOM-Elements
  var listid = this.className_ + "-" + this.storageKey_;
  this.$inputField_ = $('<input type="text">').attr('list', listid).addClass(this.className_ + "-input");
  this.$loadButton_ = $('<button>').text('Load').addClass(this.className_ + "-button-load");
  this.$saveButton_ = $('<button>').text('Save').addClass(this.className_ + "-button-save");
  this.$dataList_ = $('<datalist>').attr('id', listid).addClass(this.className_ + "-datalist");
  var addOption = function (text) {
    var $option = $('<option>').text(text);
    this.$dataList_.append($option);
  }.bind(this);
  var addOptions = function (anObject) {
    for (k in anObject) {
      addOption(k);
    }
  }.bind(this);
  // load and select presets
  var selectPreset = function() {
    // selecting the first preset
    var key = Object.keys(this.storedStates_)[0];
    // selecting a random preset
    //var key = _.sample(Object.keys(this.storedStates_));
    var state = this.storedStates_[key];
    this.$inputField_.val(key);
    this.stateExchangable_.setState(state);
  }.bind(this);
  this.selectFirst_ = opt_options.selectFirst;
  var presets = synth.Storage.load(this.storageKey_ + "-presets");
  if (!presets) {
    $.getJSON("files/" + this.storageKey_ + "-presets.json").done(function (data) {
      addOptions(data);
      this.storedStates_ = _.merge({}, data, this.storedStates_);
      if (this.selectFirst_) {
        selectPreset();
      }
    }.bind(this)).fail(function () {
      throw new Error("failed to get/parse " + this.storageKey_ + "-presets.json");
    }.bind(this));
  } else {
    this.storedStates_ = presets;
    if (this.selectFirst_) {
      selectPreset();
    }
  }
  // load custom presets (overwrite global presets with same name)
  _.merge(this.storedStates_, synth.Storage.load(this.storageKey_));
  addOptions(this.storedStates_);
  // binding event-handlers
  //this.$dataList_.on("change", function (e) {
  //  this.$inputField_.val(this.$dataList_.val());
  //}.bind(this));
  this.$saveButton_.on('click touch', function (e) {
    var text = this.$inputField_.val().trim();
    if (text != "" ) {
      this.storedStates_[text] = this.stateExchangable_.getState();
      synth.Storage.save(this.storageKey_, this.storedStates_);
      addOption(text);
    }
  }.bind(this));
  this.$loadButton_.on('click touch', function (e) {
    var text = this.$inputField_.val().trim();
    if (this.storedStates_.hasOwnProperty(text)) {
      this.stateExchangable_.setState(this.storedStates_[text]);
    }
  }.bind(this));
  // adding DOM-Elements to the Page
  this.$element_.append(this.$inputField_);
  this.$element_.append(this.$loadButton_);
  this.$element_.append(this.$saveButton_);
  this.$element_.append(this.$dataList_);
};
synth.inherits(synth.controller.Storage, synth.controller.Controller);

synth.controller.Synthesizer = function (audioContext, opt_options) {
	opt_options = opt_options || {};
  opt_options.synthesizerOptions = opt_options.synthesizerOptions || {};
  opt_options.synthesizerOptions.frequencyTable = opt_options.synthesizerOptions.frequencyTable || synth.scales.frequencyTables.a4is440Hz;
  this.instrument = new synth.instrument.ModularSynth(audioContext, opt_options.synthesizerOptions);
	this.className_ = opt_options.className || "synth-synthesizer";
	synth.controller.Controller.call(this, opt_options);
  // storage
  this.storageController_ = new synth.controller.Storage({ storageKey: "instrument", stateExchangable: this.instrument, selectFirst: true });
  this.$element_.append(this.storageController_.get$Element());
  // sound generator 1
  this.soundGenerator1Controller_ = new synth.controller.SoundGenerator(audioContext);
  this.instrument.addModule(this.soundGenerator1Controller_.module);
  this.$element_.append(this.soundGenerator1Controller_.get$Element().prepend("<p>Oscillator 1</p>"));
  // filter 1
  this.filter1Controller_ = new synth.controller.PassFilter(audioContext);
  this.soundGenerator1Controller_.module.connect(this.filter1Controller_.module);
  this.instrument.addModule(this.filter1Controller_.module);
  this.$element_.append(this.filter1Controller_.get$Element().prepend("<p>Filter 1</p>"));
  // sound generator 2
  this.soundGenerator2Controller_ = new synth.controller.SoundGenerator(audioContext);
  this.instrument.addModule(this.soundGenerator2Controller_.module);
  this.$element_.append(this.soundGenerator2Controller_.get$Element().prepend("<p>Oscillator 2</p>"));
  // filter2
  this.filter2Controller_ = new synth.controller.PassFilter(audioContext);
  this.soundGenerator2Controller_.module.connect(this.filter2Controller_.module);
  this.instrument.addModule(this.filter2Controller_.module);
  this.$element_.append(this.filter2Controller_.get$Element().prepend("<p>Filter 2</p>"));
  // merge
  this.gainController_ = new synth.controller.Gain(audioContext);
  this.instrument.setOutputModule(this.gainController_.module);
  this.$element_.append(this.gainController_.get$Element());
  this.filter1Controller_.module.connect(this.gainController_.module);
  this.filter2Controller_.module.connect(this.gainController_.module);
};
synth.inherits(synth.controller.Synthesizer, synth.controller.Controller);


synth.controller.Screen = function (opt_options) {
  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-screens";
  synth.controller.Controller.call(this, opt_options);
  this.$screens_ = [];
  this.titles_ = [];
  this.activeScreen_ = 0;
  this.$button_ = $("<button>").addClass(this.className_ + "-button").text("Switch Screen").on("click", function (e) {
    if (this.activeScreen_ == 1) {
      this.changeScreen(-1);
      this.$button_.text("Switch to " + this.titles_[1]);
    } else {
      this.changeScreen(1);
      this.$button_.text("Switch to " + this.titles_[0]);
    }
  }.bind(this));
  this.$element_.append(this.$button_);
};
synth.inherits(synth.controller.Screen, synth.controller.Controller);
synth.controller.Screen.prototype.addScreen = function($newScreen, title) {
  if(this.$screens_.length > 0) {
    $newScreen.hide();
    this.$button_.text("Switch to " + title);
  }
  this.titles_.push(title);
  this.$screens_.push($newScreen);
  this.$element_.append($newScreen);
};
synth.controller.Screen.prototype.changeScreen = function(diff) {
  var newPosition = Math.max(0, Math.min(this.activeScreen_ + diff, this.$screens_.length-1));
  this.$screens_[this.activeScreen_].hide();
  this.activeScreen_ = newPosition;
  this.$screens_[this.activeScreen_].show();
};

synth.controller.Main = function (opt_options) {
  opt_options = opt_options || {};
  this.className_ = opt_options.className || "synth-main";
  synth.controller.Controller.call(this, opt_options);
  this.audioContext_ = new (window.AudioContext || window.webkitAudioContext)();
  // creating of controllers
  this.playbackController_ = new synth.controller.Playback(this.audioContext_);
  this.playerController_ = new synth.controller.Sequencer(this.playbackController_.clock);
  this.instrumentController_ = new synth.controller.Synthesizer(this.audioContext_);
  this.playerController_.player.setInstrument(this.instrumentController_.instrument);
  this.screenController_ = new synth.controller.Screen();
  // assembly of the view
  this.$element_.append(this.playbackController_.get$Element());
  this.$element_.append(this.instrumentController_.gainController_.get$Element());
  this.screenController_.addScreen(this.playerController_.get$Element(), "Sequencer");
  this.screenController_.addScreen(this.instrumentController_.get$Element(), "Synthesizer");
  this.$element_.append(this.screenController_.get$Element());
  this.instrumentController_.instrument.connect(this.audioContext_.destination);

  // setting instrument to a more pleasant default
  //this.instrumentController_.instrument.setState();
};
synth.inherits(synth.controller.Main, synth.controller.Controller);

synth.debuggers = {};
synth.debuggers.debugCollection = function (collection) {
  var $debugTable = $("<table>");
  var $rows = $();
  $("body").append($debugTable);
  $debugTable.append($("<thead>").append($("<tr>").append($("<th>").text("Time")).append($("<th>").text("Duration")).append($("<th>").text("Value"))));
  $debugTable.append("<tbody>");
  var loop = function () {
    $debugTable.children("tbody").empty();
    collection.sort().forEach(function (timeObject) {
      $row = $("<tr>").append($("<td>").append(timeObject.time)).append($("<td>").append(timeObject.duration)).append($("<td>").append(timeObject.value));
      $debugTable.children("tbody").append($row);
    });
  };
  var interval = setInterval(loop, 50);
  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};
synth.debuggers.debugTime = function (audioContext) {
  $showTime = $("<span>");
  $("body").append($("<div>").append("currentTime: ").append($showTime));
  var loop = function () {
    $showTime.text(audioContext.currentTime);
  };
  var interval = setInterval(loop, 50);
  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};


})();
