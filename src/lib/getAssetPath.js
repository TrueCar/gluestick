import path from "path";

let APP_CONFIG;
try {
  const APP_ROOT = process.cwd();
  const APP_CONFIG_PATH = path.join(APP_ROOT, "src", "config", "application.js");
  APP_CONFIG = require(APP_CONFIG_PATH).default;
}
catch (e) {
  APP_CONFIG = {};
}

export default function (config=APP_CONFIG) {
  let assetPath = config.assetPath || "/assets";
  if (assetPath.substr(-1) !== "/") {
    assetPath = assetPath + "/";
  }

  return assetPath;
}

