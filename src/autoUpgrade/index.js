import fs from "fs";
import path from "path";
import sha1 from "sha1";
import updatePackage from "./updatePackage";
import updateConfig from "./updateConfig";
import updateBabelConfig from "./updateBabelConfig";
import logger from "../lib/logger";
import { highlight, filename } from "../lib/logsColorScheme";


class AutoUpgrade {
  constructor(options) {
    this._cwd = options.cwd || process.cwd();
    this.upgrade();
  }


  async upgrade () {
    await updatePackage();

    this.addMissingFiles();
    this.restoreModifiedFiles();

    // -> prior to 0.2.2
    await updateConfig();

    // -> prior to 0.2.9
    await updateBabelConfig();
  }


  /*
   * Let the user know that we are updating the file and copy the contents over.
   *
   * @param {String} name the name of the file
   * @param {String} data the data for the new file
   *
   */
  replaceFile (path, name, data) {
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
  getTemplateFileFromFile(filePath) {
    return fs.readFileSync(path.join(this._cwd, "..", "..", "templates", "new", filePath), "utf8");
  }


  /*
   * @param {String} filePath
   * @return {Bool} has the file changed
   */
  hasFileChanged(filePath) {
    const currentFile = fs.readFileSync(path.join(this._cwd, "..", "..", filePath));
    const newFile = path.join(this._cwd, filePath);
    return (sha1(currentFile) !== sha1(newFile));
  }

  /*
   * Composer for filechecks
   * @param {Function} fileTest
   * @param {Function} replacement
   * @return {Function} fileReplacer
   */
  testAndReplace(fileTest) {
    return (filePath) => {
      if (!fileTest(filePath)){
        const newFile = this.getTemplateFileFromFile(filePath);
        const path = path.join(this._cwd, path.parse(filePath).dir);
        const file = path.parse(filePath).base;
        this.replaceFile(path, file, newFile);
      }
    };
  }


  addMissingFiles () {
    // Check if new files haven't been created yet
    [
      "src/config/application.js",        //-> prior to 0.1.6
      "src/config/webpack-additions.js",  //-> prior to 0.1.12
      "src/config/redux-middleware.js",   //-> prior to 0.1.12
      "src/config/.Dockerfile",           //-> prior to 0.2.0
      ".dockerignore"                     //-> prior to 0.3.6
    ].forEach(this.testAndReplace(fs.existsSync));
  }

  restoreModifiedFiles () {
    // Check hidden files for changes, and overwrite if needed
    [
      "src/config/.entry.js",
      "src/config/.store.js",
      "src/config/.Dockerfile"   //-> last updated in 0.2.0
    ].forEach(this.testAndReplace(this.hasFileChanged));
  }
}


export default async function (options) {
  new AutoUpgrade(options);
};

