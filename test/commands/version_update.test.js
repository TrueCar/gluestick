import "babel-polyfill";
import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import mkdirp from "mkdirp";
import path from "path";
import updateLastVersionUsed from "./lib/updateVersion.js";


describe("cli: gluestick touch", function () {

  let originalCwd, tmpDir, sandbox, dotFile;

  let fileExists = function(path) {
      return fs.existsSync(tmpDir + path);
  };

  let newDotFileContents = function(contents) {
    fs.writeFileSync(dotFile, contents);
  }
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-touch");
    process.chdir(tmpDir);
    dotFile = tmpDir + ".gluestick";
    
    fs.closeSync(fs.openSync(dotFile, "w"));

    sandbox = sinon.sandbox.create();
    sandbox.spy(console, "log");
    sandbox.spy(console, "error");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });
  
  it("should not error if the old \"DO NOT MODIFY\" header is in the .gluestick file", () => {
    newDotFileContents("DO NOT MODIFY\n{'version':'"+getVersion()+"'}"); 
    updateLastVersionUsed();
    expect(console.error.notCalled()).to.be.true;
  });

  it("should remove the \"DO NOT MODIFY\" header from the .gluestick file", () => {
    newDotFileContents("DO NOT MODIFY\n{'version':'"+getVersion()+"'}"); 
    updateLastVersionUsed();
    var fileContents = fs.readFileSync(dotFile, {encoding: "utf8"});
    expect(fileContents.indexOf("DO NOT MODIFY")).to.equal(-1); 
  });

  
  it("should update project version to devs version", () => {
    newDotFileContents("DO NOT MODIFY\n{'version':'"+getVersion()+"'}"); 
    updateLastVersionUsed();
    var fileContents = fs.readFileSync(dotFile, {encoding: "utf8"});
    var json = JSON.parse(fileContents);
    expect(json.version).to.equal(getVersion()); 
  });
}
