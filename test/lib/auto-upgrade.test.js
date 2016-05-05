import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import path from "path";
import temp from "temp";
import mkdirp from "mkdirp";
import rimraf from "rimraf";
import logger from "../../src/lib/logger";
import autoUpgrade, { restoreModifiedFiles } from "../../src/autoUpgrade/index.js";


describe("auto upgrade of legacy files", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("auto-upgrade");
    process.chdir(tmpDir);

    sandbox = sinon.sandbox.create();
    sandbox.spy(logger, "success");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });



  it("should replace modified files with values from templates", () => {
    // SETUP
    const files = [
      "src/config/.entry.js",
      "src/config/.store.js",
      "src/config/.Dockerfile"   //-> last updated in 0.2.0
    ];

    files.forEach((filePath) => {
      const templatePath = path.join(originalCwd, "new", filePath);
      const file = fs.readFileSync(templatePath, "utf8");
      const dirForFile = path.join(tmpDir, path.parse(filePath).dir);
      mkdirp.sync(dirForFile);
      fs.closeSync(fs.openSync(path.join(dirForFile, path.parse(filePath).base), "w"));
      fs.writeFileSync(path.parse(filePath).base, file);
    });

    // INTRODUCE CHANGE
    let modifiedFile = fs.readFileSync(files[0], "utf8");
    modifiedFile += "\nadded textual changes!!!";
    fs.writeFileSync(files[0], modifiedFile);

    restoreModifiedFiles();

    // tests
    expect(logger.success.calledWith("Updating")).to.be.true;
  });


  //it("should create missing dot files", () => {
    //const files = [
      //"src/config/.entry.js",
      //"src/config/.store.js",
      //"src/config/.Dockerfile"   //-> last updated in 0.2.0
    //];
    //files.forEach(
      //return fs.readFileSync(path.join(__dirname, "..", "..", "new", filePath), "utf8");
      //fs.writeFileSync(filePath, data);
  //});

  //it("should detect a change in the file by checking it against the template", () => {
    //// create file from template
    //// modify new file and save
    //// run `hasFileChanged`
    //// assert the result
  //});


  //it("should create new files that haven't been created yet", () => {
    //// run test and replace for fs.existsSync over a specific file
    //// check for the specific template file to make sure it was created at the new location
  //});


  //it("should replace hidden files that have been altered", () => {
    //// create hidden file from template
  //});
});
