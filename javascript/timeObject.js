// #ifndef __TIMEOBJECT__
// #define __TIMEOBJECT__

// #include "init.js"

synth.timeObject = {};

synth.timeObject.includes = function (timeObject, time) {
	return timeObject.time < time && timeObject.time + timeObject.duration > time;
};

// #endif