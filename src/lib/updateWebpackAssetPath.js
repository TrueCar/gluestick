import { cp, ls, sed, rm } from "shelljs";
const fs = require("fs-extra");
const path = require("path");

const PLACEHOLDER = new RegExp("__GS_ASSET_URL__", "g");

module.exports = function (assetUrl=process.env.ASSET_URL) {
  let originalData;

  assetUrl = assetUrl || "/assets";

  const cwd = process.cwd();

  const webpackAssetsPathOriginalCopy = path.join(cwd, "_webpack-assets.json");
  const webpackAssetsPath = path.join(cwd, "webpack-assets.json");

  const buildPathOriginalCopy = path.join(cwd, "_build");
  const buildPath = path.join(cwd, "build");

  try {
    // If this is not our first time then the backup _webpack-assets will exist
    fs.statSync(webpackAssetsPathOriginalCopy);
    originalData = fs.readFileSync(webpackAssetsPathOriginalCopy, "utf8");
  }
  catch (e) {
    // Must be our first time, back up webpack-assets and the build folder so
    // we can use the backups for future replacements
    originalData = fs.readFileSync(webpackAssetsPath, "utf8");
    fs.writeFileSync(webpackAssetsPathOriginalCopy, originalData);
    cp("-R", buildPath, buildPathOriginalCopy);
  }

  // swap webpack assets with original before our replace
  rm(webpackAssetsPath);
  cp(webpackAssetsPathOriginalCopy, webpackAssetsPath);
  sed("-i", PLACEHOLDER, assetUrl, webpackAssetsPath);

  // swap build folder with original before our replace
  rm("-R", buildPath);
  cp("-R", buildPathOriginalCopy, buildPath);

  // grab ALL of the files in the build folder (filter exists because of
  // awkward `ls` output
  const buildFiles = ls("build/**").filter(f => f.substr(0, 6) === "build/");
  sed("-i", PLACEHOLDER, assetUrl, buildFiles);
};

