// #ifndef __EVENTHANDLING
// #define __EVENTHANDLING


synth.ObservableObject = function ( opt_options ) {

    opt_options = opt_options || {};

    this.EventListeners_ = this.EventListeners_ || {};
    this.customKey_ = this.customKey_ || 0;
};

/**
 * This will register the event type and will prevent spelling mistakes ;)
 */

synth.ObservableObject.prototype.registerEventType = function (type) {
    this.EventListeners_[type] = [];
};

/**
 * Fires all eventhandlers/listeners applied to the object with type type
 * Will not get passed to passClass.
 * @param {string} type type of the event f.e. "change"
 * @param {Array} passArgs an array of arguments which will be applied (using .apply) to the eventhandlers/listeners
 */

synth.ObservableObject.prototype.fireEvent = function ( type, passArgs ) {

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

//synth.ObservableObject.prototype.hasListenersOnEvent = function ( type ) {

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
synth.ObservableObject.prototype.on = function ( type, listener, opt_this ) {
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
synth.ObservableObject.prototype.once = function ( type, listener, opt_this ) {
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
synth.ObservableObject.prototype.un = function ( type, listener, opt_this ) {
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
synth.ObservableObject.prototype.unByKey = function ( key ) {
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

// #endif
