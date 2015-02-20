var fs = require("fs");
var uprocess = require("uprocess");

fs.writeFileSync("synth.js", uprocess.readFile("../src/main.js"));