// #ifndef __SCALES__
// #define __SCALES__

synth.scales = {};

(function () {

  // i calculate frequencies from note c0 to b8
  // the given index and frequency specifies the frequency of the specified note, all others are caluculated accordingly
  var calculateFrequencies = function (index, frequency) {

    var frequencies = [];
    var number = 12 * 9;
    var a = Math.pow(2, 1/12);

    for (var i=0; i<number; i++) {
      frequencies.push(frequency*Math.pow(a, i-index));
    }

    return frequencies;
  };

  synth.scales.getIndexOf = function (step, intervals, baseNoteIndex) {
    var octaveLength = intervals.reduce( function (prev, cur) { return prev+cur; } );
    var octaveModifier = Math.floor(step/octaveLength);
    return intervals.slice(0, step % intervals.length).reduce( function (prev, cur) { return prev+cur; }, baseNoteIndex + octaveModifier * octaveLength );
  };

  synth.scales.intervals = {};
  synth.scales.intervals.major = [2,2,1,2,2,2,1];
  synth.scales.intervals.minor = [2,1,2,2,1,2,2];
  synth.scales.intervals.minorGypsy = [2,1,3,2,1,3,1];
  synth.scales.intervals.majorGypsy = [1,3,1,2,1,3,2];
  synth.scales.intervals.bluesMinor = [3,2,1,1,3,2];
  synth.scales.intervals.bluesMajor = [2,1,1,3,2,1,2];
  //synth.scales.intervals.rockNRoll = [2,1,1,1,1,1,2,1,2];

  synth.scales.frequencyTables = {}
  synth.scales.frequencyTables.a4is432Hz = calculateFrequencies( 57, 432 );
  synth.scales.frequencyTables.a4is434Hz = calculateFrequencies( 57, 434 );
  synth.scales.frequencyTables.a4is436Hz = calculateFrequencies( 57, 436 );
  synth.scales.frequencyTables.a4is437Hz = calculateFrequencies( 57, 438 );
  synth.scales.frequencyTables.a4is440Hz = calculateFrequencies( 57, 440 );
  synth.scales.frequencyTables.a4is442Hz = calculateFrequencies( 57, 442 );
  synth.scales.frequencyTables.a4is444Hz = calculateFrequencies( 57, 444 );
  synth.scales.frequencyTables.a4is446Hz = calculateFrequencies( 57, 446 );

})();

// #endif
