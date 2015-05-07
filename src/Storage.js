// #ifndef __STORAGE__
// #define __STORAGE__

synth.Storage = {
  save: function (key, object) {
	  localStorage.setItem(key, JSON.stringify(object));
  },
  load: function (key) {
	  return JSON.parse(localStorage.getItem(key));
  }
};

// #endif
