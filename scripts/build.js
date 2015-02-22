var fs = require("fs");
var uprocess = require("uprocess");

fs.writeFileSync("build/synth.js", uprocess.processFile("src/main.js"));