import fs from "fs";
import path from "path";
import sha1 from "sha1";
import updatePackage from "./updatePackage";
import updateConfig from "./updateConfig";
import updateBabelConfig from "./updateBabelConfig";
import logger from "../lib/logger";
import { highlight, filename } from "../lib/logsColorScheme";

const CWD = process.cwd();


/*
 * Let the user know that we are updating the file and copy the contents over.
 *
 * @param {String} name the name of the file
 * @param {String} data the data for the new file
 *
 */
function replaceFile (path, name, data) {
  const filePath = path.join(path, name);
  logger.info(`${highlight(name)} file out of date.`);
  logger.success(`Updating ${filename(filePath)}`);

  fs.writeFileSync(filePath, data);
}


/*
 * template file getter
 * @param {String} filePath normal file path to retrieve from template directory
 * @return {String} file contents
 *
 */
function getTemplateFileFromFile(filePath) {
  return fs.readFileSync(path.join(__dirname, "..", "..", "new", filePath), "utf8");
}


/*
 * @param {String} filePath
 * @return {Bool} has the file changed
 */
function hasFileChanged(filePath) {
  const currentFile = fs.readFileSync(path.join(__dirname, "..", "..", filePath));
  const newFile = path.join(CWD, filePath);
  return (sha1(currentFile) !== sha1(newFile));
}

/*
 * Composer for filechecks
 * @param {Function} fileTest
 * @param {Function} replacement
 * @return {Function} fileReplacer
 */
function testAndReplace(fileTest) {
  return function (filePath) {
    if (!fileTest(filePath)){
      const newFile = getTemplateFileFromFile(filePath);
      const path = path.join(CWD, path.parse(filePath).dir);
      const file = path.parse(filePath).base;
      replaceFile(path, file, newFile);
    }
  };
}




module.exports = async function () {
  await updatePackage();


  // Check if new files haven't been created yet
  [
    "src/config/application.js",        //-> prior to 0.1.6
    "src/config/webpack-additions.js",  //-> prior to 0.1.12
    "src/config/redux-middleware.js",   //-> prior to 0.1.12
    "src/config/.Dockerfile",           //-> prior to 0.2.0
    ".dockerignore"                     //-> prior to 0.3.6
  ].forEach(testAndReplace(fs.existsSync));


  // Check hidden files for changes, and overwrite if needed
  [
    "src/config/.entry.js",
    "src/config/.store.js",
    "src/config/.Dockerfile"   //-> last updated in 0.2.0
  ].forEach(testAndReplace(hasFileChanged));


  // -> prior to 0.2.2
  await updateConfig();

  // -> prior to 0.2.9
  await updateBabelConfig();
};

