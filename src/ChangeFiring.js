// #ifndef __CHANGEFIRING__
// #define __CHANGEFIRING__

// #include "Observable.js"

synth.ChangeFiring = function () {

  synth.Observable.call(this);

  this.properties_ = {};

  //this.registerEventType("propertychange");
};
synth.inherits(synth.ChangeFiring, synth.Observable);


synth.ChangeFiring.prototype.set = function (propertyName, value) {

  var oldValue = this.properties_[propertyName];

  this.properties_[propertyName] = value;

  if (!this.properties_.hasOwnProperty(propertyName)) {
    this.registerEventType("change:" + propertyName);
  }

  if (oldValue !== value ) {
    var e = { oldValue: oldValue, newValue: value };
    this.fireEvent("change:" + propertyName, [e]);
    //this.fireEvent("propertychange", [e]);
  }
};

synth.ChangeFiring.prototype.get = function (propertyName) {
  return this.properties_[propertyName];
};


// #endif
