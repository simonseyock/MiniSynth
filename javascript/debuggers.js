// #ifndef __debuggers__
// #define __debuggers__

synth.debuggers = {};

synth.debuggers.debugCollection = function (collection) {
  var $debugTable = $("<table>");
  var $rows = $();
  $("body").append($debugTable);

  $debugTable.append($("<thead>").append($("<tr>").append($("<th>").text("Time")).append($("<th>").text("Duration")).append($("<th>").text("Value"))));
  $debugTable.append("<tbody>");

  var loop = function () {
    $debugTable.children("tbody").empty();
    collection.sort().forEach(function (timeObject) {
      $row = $("<tr>").append($("<td>").append(timeObject.time)).append($("<td>").append(timeObject.duration)).append($("<td>").append(timeObject.value));
      $debugTable.children("tbody").append($row);
    });
  };

  var interval = setInterval(loop, 50);

  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};

synth.debuggers.debugTime = function (audioContext) {
  $showTime = $("<span>");
  $("body").append($("<div>").append("currentTime: ").append($showTime));
  var loop = function () {
    $showTime.text(audioContext.currentTime);
  };
  var interval = setInterval(loop, 50);

  var toggle = false;
  $(document).on("keydown", function (e) {
    if (e.which === 27) {
      toggle = !toggle;
      if(toggle) {
        clearInterval(interval);
      } else {
        interval = setInterval(loop, 50);
      }
    }
  });
};

// #endif
