// #ifndef __STATEEXCHANGEOBJECT__
// #define __STATEEXCHANGEOBJECT__

// #include "init.js"

// NOTE: Question: (important) How to prevent Circles? (difficult) How to reduce Redundancy?

synth.StateExchangeObject = function () {
	this.state_ = {};
};

synth.StateExchangeObject.stateExchangeFactory_ = {
	prototypes: [],
	addType: function (name, aPrototype) {
		this.prototypes[name] = aPrototype;
	},
	createObject: function (name) {
		if(name in this.prototypes) {
			return new this.prototypes[name]();
		} else {
			return {};
		}
	}
};

synth.StateExchangeObject.addType = function (typeName, aPrototype) {
	synth.StateExchangeObject.stateExchangeFactory_.addType(typeName, aPrototype);
};

/**
 * @param name {string}
 * @param getter {function} should return valid JSON (http://json.org)
 * @parma setter {function}
 */
synth.StateExchangeObject.prototype.addNormalStateParameter = function (name, getter, setter) {
	this.state_[name] = { get: getter, set: setter };
};

/**
 * @param name {string}
 * @param getter {function} should return a {synth.StateExchangeObject} !
 * @parma setter {function} should accept a {synth.StateExchangeObject}
 */
synth.StateExchangeObject.prototype.addExchangeObjectStateParameter = function (name, getter, setter) {
	this.state_[name] = { 
		get: function() { 
			return { type: getter().typeName, state: getter().getState() };
		}, 
		set: function(typedState) { 
			// insert validation if obj is already of the same type here
			var obj = synth.StateExchangeObject.stateExchangeFactory_.createObject(typedState.typeName);
			obj.setState(typedState.state);
			setter(obj);
		}
	};
};

/**
 * @param name {string}
 * @param getter {function} should return a {synth.StateExchangeObject[]} !
 * @parma setter {function} should accept a {synth.StateExchangeObject[]}
 */
synth.StateExchangeObject.prototype.addExchangeObjectArrayStateParameter = function (name, getter, setter) {
	this.state_[name] = { 
		get: function() {
			var retArr = [];
			var stateExchangeObjects = getter();
			for (var i=0; stateExchangeObjects.length; i++) {
				retArr.push({ type: stateExchangeObjects[i].typeName, state: stateExchangeObjects.getState() });
			}
			return retArr;
		}, 
		set: function(typedStates) { 
			// insert validation if obj is already of the same type here
			var setArr = [];
			for (var i=0; typedStates.length; i++) {
				setArr.push(synth.StateExchangeObject.stateExchangeFactory_ .createObject(typedStates[i].typeName));
			}
			obj.setState(typedState.state);
			setter(obj);
		}
	};
};

/**
 * @returns {JSON} (if all setted values where valid json)
 */

synth.StateExchangeObject.prototype.getState = function (opt_parameter) {
	if (opt_parameter) {
		// insert validation if opt_parameter is in state
		return this.state_[opt_parameter].get();
	} else {
		var state = {};
		for (var key in this.state_) {
			state[key] = this.state_.get();
		}
		return state;
	} 
	
	return undefined;
};

/**
 * @param value {JSON} needs to be plain JSON! If (look it up on http://json.org)
 */

synth.StateExchangeObject.prototype.setState = function (opt_parameter, value) {
	// shuffle arguments ;)
	if (arguments.length === 1) {
		value = arguments[0];
		opt_parameter = undefined;
	}
	
	if (opt_parameter) {
		this.state_[opt_parameter].set( value );
	} else {
		for (key in value) {
			this.state_[key].set(value[key]);
		}
	}	
};

// #endif