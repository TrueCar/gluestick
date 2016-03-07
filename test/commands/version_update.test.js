// setup for all non "generate" tests
//  create a blank project
// setup for "generate" tests



import "babel-polyfill";
import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import glob from "glob";
import mkdirp from "mkdirp";
import path from "path";
import destroy from "../../src/commands/destroy";
import npmDependencies from "../../src/lib/npm-dependencies";

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
  
  it("should throw an error when (container|component|reducer) is not specified", () => { 
    destroy('blah',''); 
    expect(console.log.calledWithMatch("is not a valid destroy command.")).to.be.true;
  });

