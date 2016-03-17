const fs = require("fs");
const path = require("path");

module.exports = function getVersion () {
  const packageFileContents = fs.readFileSync(path.join(__dirname, "..", "..", "package.json"));
  const packageObject = JSON.parse(packageFileContents);
  return packageObject.version;
};
