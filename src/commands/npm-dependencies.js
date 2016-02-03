const spawn = require("child_process").spawn;

const IS_WINDOWS = process.platform === "win32";

function install () {
  var postFix = IS_WINDOWS ? ".cmd" : "";
  spawn("npm" + postFix, ["install"], {stdio: "inherit"});
}

module.exports = {
  install: install
}
