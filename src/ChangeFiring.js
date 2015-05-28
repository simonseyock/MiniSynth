// #ifndef __CHANGEFIRING__
// #define __CHANGEFIRING__

// #include "Observable.js"

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


// #endif
