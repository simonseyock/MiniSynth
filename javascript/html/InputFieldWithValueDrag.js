// #ifndef __INPUTFIELDWITHDRAG__
// #define __INPUTFIELDWITHDRAG__

// #include "InputField.js"

synth.html.InputFieldWithValueDrag = function (resolution) {
	synth.html.InputField.call(this);
	
	this.resolution_ = resolution || 1;
	
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
	
	var onMouseDown = function (e) {
		drag = true;
		lastY = e.pageY;

		//positionY = this.$element_.offset().top + this.$element_.height() * 0.5;
		
		//interval = setInterval(updateValue, 50);
	}.bind(this);
	
	var onMouseMove = function (e) {
		if(drag) {
			var distance = lastY - e.pageY;
			
			this.$element_.val(parseFloat(this.$element_.val()) + distance * this.resolution_);
			this.fireEvent("input");
			
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
		onMouseMove_(e);
	});
	this.$element_.on("touchend", onMouseUp);
};
synth.inherits(synth.html.InputFieldWithValueDrag, synth.html.InputField);


// #endif