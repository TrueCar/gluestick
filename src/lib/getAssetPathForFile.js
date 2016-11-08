import path from "path";
import fs from "fs";
import getAssetPath from "./getAssetPath";

const IS_PROD = process.env.NODE_ENV === "production";

let WEBPACK_ASSETS;
try {
  const APP_ROOT = process.cwd();
  const WEBPACK_ASSETS_FILE_PATH = path.join(APP_ROOT, "webpack-assets.json");
  // This is only run once when the app spins up
  WEBPACK_ASSETS = JSON.parse(fs.readFileSync(WEBPACK_ASSETS_FILE_PATH));
  const ORIGINAL_ASSET_PATH_INFO_PATH = path.join(APP_ROOT, "build", "asset-path.json");
  WEBPACK_ASSETS.originalAssetPath = JSON.parse(fs.readFileSync(ORIGINAL_ASSET_PATH_INFO_PATH)).assetPath;
}
catch (e) {
  WEBPACK_ASSETS = {
    javascript: {},
    styles: {},
    assets: {},
    path: ""
  };
}

export default function (filename, section, webpackAssets=WEBPACK_ASSETS, isProduction=IS_PROD, config) {
  const assetPath = getAssetPath(config);
  const assets = webpackAssets[section] || {};
  const webpackPath = assets[filename];

  // in development mode, webpack-assets.json is always up to date because assets
  // are constantly rebuilt.
  if (!isProduction) {
    return webpackPath;
  }

  // In production, it is possible that the assets were built with a different
  // assetPath than what is currently reflected in src/config/application.js.
  // This is because you can override the assetPath with an environment
  // variable if you want to. To resolve this, we check if the assetPath used
  // during the build step matches the current assetPath. If not, then we
  // replace what was the assetPath with what is the assetPath.
  const originalPath = webpackAssets.path;
  if (originalPath !== assetPath) {
    return `${assetPath}${webpackPath.substr(originalPath.length)}`;
  }

  return webpackPath;
}

