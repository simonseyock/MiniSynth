// #include "init.js"

// #error "use .var version"
/**

*/


synth.StateExchangeObject = function () {
	this.state_ = {};
	
	// should have event statechange:parameter for every parameter changed
	// should fire an event statechange:all which fires when all states change, all other statechange events needs to fire, too
	// could have an event statechange:any which fires when any state changes
};

/*
* @returns {JSON}
*/
synth.StateExchangeObject.prototype.getState = function (opt_parameter) {
	
	function getState_(object) {		
		var state = {};
		for(key in this.state_) {
			if(!this.state_.hasOwnProperty(key)) {
				continue;
			}
			if (this.state_[key].getState) {
				state[key] = this.state_[key].getState();
			// } else if (_.isNumber(this.state_[key]) || _.isString(this.state_[key]) || _.isBoolean(this.state_[key]) || _.isNull(this.state_[key])) {
				// state[key] = this.state_[key];
			} else if (_.isArray(this.state_[key]) || _.isPlainObject(this.state_[key])) {
				state[key] = getState_.call(this, this.state_[key]);
			} else {
				//throw new Error("Illegal state value encountered
				state[key] = this.state_[key];
			}
		}
	}
	
	if (opt_parameter) {
		if(opt_parameter in this.state_) {
			return getState_.call(this, this.state_[opt_parameter]);
		}
	} else {
		return getState_.call(this, this.state_);
	} 
	
	return undefined;
};

synth.StateExchangeObject.prototype.getStateParameters = function () {
	return Object.keys(this.state_);
};

/**
 * @param value {JSON|synth.StateExchangeObject} isn't enforced to be JSON due to performance reasons - but should be JSON! Except the JSON can have ``synth.stateExchangeObject``s as values.
 */

synth.StateExchangeObject.prototype.setState = function (opt_parameter, value) {
	if (arguments.length === 1) {
		value = arguments[0];
		opt_parameter = undefined;
	}
	
	// check if value is legal
	// if (value.getState) {
		// //legal
	// } else if (_.isNumber(value[key]) || _.isString(value[key]) || _.isBoolean(value[key]) || _.isNull(value[key])) {
		// //legal
	// } else if (_.isArray(value[key]) || _.isPlainObject(value[key])) {
		// //legal
	// } else {
		// throw new Error("Illegal state value encountered!");
	// }
	
	if (opt_parameter) {
		this.state_[opt_parameter] = value;
		//fire statechange:opt_parameter
		//fire statechange (or statechange:any)
	} else {
		this.state_ = value;
		//fire all(!) statechange events
	}	
};
