const spawn = require("cross-spawn").spawn;

const IS_WINDOWS = process.platform === "win32";

function install () {
  const postFix = IS_WINDOWS ? ".cmd" : "";
  spawn("npm" + postFix, ["install"], {stdio: "inherit"});
}

module.exports = {
  install: install
};
