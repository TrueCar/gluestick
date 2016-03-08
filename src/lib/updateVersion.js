const fs = require("fs");
const path = require("path");
const getVersion = require("./getVersion.js");
const logger = require("./../../lib/logger");

module.exports = function updateLastVersionUsed() {
  // Check version in .gluestick file
  const gluestickDotFile = path.join(process.cwd(), ".gluestick");
  var fileContents = fs.readFileSync(gluestickDotFile, {encoding: "utf8"})
  // We won't know how old this version is, it might have still have the 'DO NOT MODIFY' header
  fileContents = fileContents.replace("DO NOT MODIFY", "");

  // If the dot file only had the header (and possibly a new line character), then it definitely doesn't have the version check and is old
  fileContents = (fileContents.length <= 1)? '{"version": "`unknown version`"}': fileContents;
  var json = JSON.parse(fileContents);
  if (getVersion() !== json.version) {
    logger.warn("This project is configured to work with versions >= " + json.version + " Please upgrade your global `gluestick` module with `sudo npm install gluestick -g");
  }

  // update version in dot file. No longer want the 'Do Not Modify' text
  const newContents = JSON.stringify({version: getVersion()});
  fs.writeFileSync(gluestickDotFile, newContents);
} 
