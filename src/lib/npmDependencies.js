import path from "path";
import rimraf from "rimraf";
const spawn = require("cross-spawn").spawn;
import { which } from "shelljs";

const IS_WINDOWS = process.platform === "win32";

function install () {
  if (which("yarn") !== null) {
    return spawn("yarn", {stdio: "inherit"});
  }

  const postFix = IS_WINDOWS ? ".cmd" : "";
  return spawn("npm" + postFix, ["install"], {stdio: "inherit"});
}

function cleanSync () {
  // wipe the existing node_modules folder so we can have a clean start
  rimraf.sync(path.join(process.cwd(), "node_modules"));
  spawn.sync("npm", ["cache", "clean"], {stdio: "inherit"});
}

module.exports = {
  cleanSync: cleanSync,
  install: install
};
