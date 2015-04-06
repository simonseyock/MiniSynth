/*
 * This file is just for documentation purposes
 */

timeObject = {
  time: /* {double}, time the object starts */ 0,
  duration: /* {double}, time the object lasts */ 0,
  value: /* {any, comparable}, a value associated with this timeObject, will be used together with time and duration to identify this object */ null,
  data: /* an object to store data for this timeObject */ {}
};

envelope = {
  attack: /* {double}, attack time */ 0,
  decay: /* {double}, decay time */ 0,
  sustain: /* {float}, sustain level */ 1,
  release: /* {double}, release time */ 0
};
