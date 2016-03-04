const fs = require("fs");
const path = require("path");

module.exports = function getVersion () {
  var packageFileContents = fs.readFileSync(path.join(__dirname, "..", "..", "package.json"));
  var packageObject = JSON.parse(packageFileContents);
  return packageObject.version;
}
