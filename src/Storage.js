// #ifndef __STORAGE__
// #define __STORAGE__

synth.Storage = {
  saveObject: function (key, object) {
	  localStorage.setItem(key, JSON.stringify(object));
  },
  retrieveObject: function (key) {
	  return JSON.parse(localStorage.retrieveItem(key));
  }
};

// #endif
