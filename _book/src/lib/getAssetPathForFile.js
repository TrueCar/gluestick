import path from "path";
import fs from "fs";

let WEBPACK_ASSETS;
try {
  const APP_ROOT = process.cwd();
  const WEBPACK_ASSETS_FILE_PATH = path.join(APP_ROOT, "webpack-assets.json");
  // This is only run once when the app spins up
  WEBPACK_ASSETS = JSON.parse(fs.readFileSync(WEBPACK_ASSETS_FILE_PATH));
}
catch (e) {
  WEBPACK_ASSETS = {
    javascript: {},
    styles: {},
    assets: {},
    path: ""
  };
}

export default function (filename, section, webpackAssets=WEBPACK_ASSETS) {
  const assets = webpackAssets[section] || {};
  const webpackPath = assets[filename];

  return webpackPath;
}

