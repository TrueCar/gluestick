/**
 * @NOTE: Don't use shelljs.sed unless it is fixed:
 * Using `replaceInFile` instead of shelljs.sed because shelljs.sed reads files
 * into an array, then runs replace over each line before writing back to the
 * file. This was a problem when trying to read binary files like images.
 * `replace-in-file` has better code that doesn't try to split the file into an
 * array, then join it back and it wont change the file if nothing is changed.
 */
import { cp, rm } from "shelljs";
import replaceInFile from "replace-in-file";
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
  replaceInFile.sync({
    files: [webpackAssetsPath],
    replace: PLACEHOLDER,
    with: assetUrl
  });

  // swap build folder with original before our replace
  rm("-R", buildPath);
  cp("-R", buildPathOriginalCopy, buildPath);

  // grab ALL of the files in the build folder (filter exists because of
  // awkward `ls` output
  replaceInFile.sync({
    files: [path.join(process.cwd(), "build/**")],
    replace: PLACEHOLDER,
    with: assetUrl
  });
};

