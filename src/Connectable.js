// #ifndef __CONNECTABLE__
// #define __CONNECTABLE__

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

// #endif
