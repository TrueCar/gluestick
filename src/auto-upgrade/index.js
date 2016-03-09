import fs from "fs";
import path from "path";
import sha1 from "sha1";
import updatePackage from "./updatePackage";
import updateConfig from "./updateConfig";
import updateBabelConfig from "./updateBabelConfig";
import logger from "../lib/logger";
import { highlight, filename } from "../lib/logsColorScheme";
import { isGluestickProject } from "../lib/utils";

const CWD = process.cwd();

/**
 * Let the user know that we are updating the file and copy the contents over.
 *
 * @param {String} name the name of the file
 * @param {String} data the data for the new file
 */
function replaceFile (name, data) {
  const filePath = getCurrentFilePath(name);
  logger.info(`${highlight(name)} file out of date.`);
  logger.success(`Updating ${filename(filePath)}`);

  fs.writeFileSync(filePath, data);
}

/**
 * Get the path to the file in the current project's config folder.
 *
 * @param {String} name the file name we are looking for
 */
function getCurrentFilePath (name) {
  return path.join(CWD, "src", "config", name);
}

module.exports = async function () {
  if (!isGluestickProject()) {
    return new Error("commands must be run from the root of a gluestick project");
  }

  await updatePackage();

  // Check for certain files that we've added to new Gluestick applications. If those files don't exist, add them
  // for the user.
  const newFiles = [
    "src/config/application.js",        //-> prior to 0.1.6
    "src/config/webpack-additions.js",  //-> prior to 0.1.12
    "src/config/redux-middleware.js",   //-> prior to 0.1.12
    "src/config/.Dockerfile"            //-> prior to 0.2.0
  ];
  newFiles.forEach((filePath) => {
    try {
      fs.statSync(path.join(CWD, filePath));
    }
    catch (e) {
      const fileName = path.parse(filePath).base;
      const newFile = fs.readFileSync(path.join(__dirname, "..", "..", "new", filePath), "utf8");
      replaceFile(fileName, newFile);
    }
  });

  // Compare contents of our hidden files, if they do not match up then auto
  // update
  [
    ".entry.js",
    ".store.js",
    ".Dockerfile",   //-> last updated in 0.2.0
  ].forEach((fileName) => {
    const currentFile = fs.readFileSync(getCurrentFilePath(fileName));
    const currentSha = sha1(currentFile);

    const newFile = fs.readFileSync(path.join(__dirname, "..", "..", "new", "src", "config", fileName), "utf8");
    const newSha = sha1(newFile);

    if (currentSha !== newSha) {
      replaceFile(fileName, newFile);
    }
  });


  // -> prior to 0.2.2
  await updateConfig();

  // -> prior to 0.2.9
  await updateBabelConfig();
};
