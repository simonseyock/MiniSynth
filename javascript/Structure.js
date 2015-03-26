/*
 * This file contains structural helper functions
 */

synth.inherits = function (child, parent) {
	jQuery.extend(child.prototype, parent.prototype);
};

synth.abstractFunction = function () {
	throw new Error("You tried to call an abstract function. Yuck.");
};