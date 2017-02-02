import fs from "fs";
import path from "path";
import sha1 from "sha1";
import updatePackage from "./updatePackage";
import { getLogger } from "../lib/server/logger";
const logger = getLogger();

const CWD = process.cwd();

/**
 * Let the user know that we are updating the file and copy the contents over.
 *
 * @param {String} name the name of the file
 * @param {String} data the data for the new file
 */
function replaceFile (name, data) {
  const filePath = getCurrentFilePath(name);
  logger.info(`${name} file out of date.`);
  logger.info(`Updating ${filePath}`);
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

module.exports = async function (logLevel) {
  logger.level = logLevel || "warn";

  await updatePackage();

  // Check for certain files that we've added to new Gluestick applications. If those files don't exist, add them
  // for the user.
  const newFiles = [
    "src/config/application.js",        //-> prior to 0.1.6
    "src/config/webpack-additions.js",  //-> prior to 0.1.12
    "src/config/redux-middleware.js",   //-> prior to 0.1.12
    "src/config/.Dockerfile",           //-> prior to 0.2.0
    ".dockerignore",                    //-> prior to 0.3.6
    "src/config/init.browser.js"        //-> prior to 0.9.26
  ];
  newFiles.forEach((filePath) => {
    try {
      fs.statSync(path.join(CWD, filePath));
    }
    catch (e) {
      const fileName = path.parse(filePath).base;
      const newFile = fs.readFileSync(path.join(__dirname, "..", "..", "templates", "new", filePath), "utf8");
      replaceFile(fileName, newFile);
    }
  });

  // Compare contents of our hidden files, if they do not match up then auto
  // update
  [
    ".entry.js",
    ".Dockerfile"   //-> last updated in 0.2.0
  ].forEach((fileName) => {
    const currentFile = fs.readFileSync(getCurrentFilePath(fileName));
    const currentSha = sha1(currentFile);

    const newFile = fs.readFileSync(path.join(__dirname, "..", "..", "templates", "new", "src", "config", fileName), "utf8");
    const newSha = sha1(newFile);

    if (currentSha !== newSha) {
      replaceFile(fileName, newFile);
    }
  });

};
