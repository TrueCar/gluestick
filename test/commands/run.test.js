/*global afterEach beforeEach describe it*/
import { expect } from "chai";
import fs from "fs";
import path from "path";
import temp from "temp";
import rimraf from "rimraf";
import mkdirp from "mkdirp";
import run from "../../src/commands/run";

function getDoStuffScript () {
  return `
    var fs = require("fs");
    var path = require("path");
    console.log('      -> Hello gluestick runner script');
    fs.writeFileSync(path.join(__dirname, "..", "test.txt"), "written from runner");
  `;
}

describe("cli: gluestick run", function () {

  let originalCwd, tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-run");
    process.chdir(tmpDir);

    fs.closeSync(fs.openSync(".gluestick", "w"));
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("runs the provided script", (done) => {
    mkdirp.sync(path.join(tmpDir, "scripts"));
    const filePath = path.join(tmpDir, "scripts", "doStuff.js");
    fs.closeSync(fs.openSync(path.join(tmpDir, "webpack-assets.json"), "w"));
    fs.writeFileSync(filePath, getDoStuffScript());
    run("scripts/doStuff", (error) => {
      const output = fs.readFileSync(path.join(tmpDir, "test.txt"), "utf8");
      expect(output).to.equal("written from runner");
      expect(error).to.be.undefined;
      done();
    });
  });

  it("throws error if the provided script does not exist", (done) => {
    mkdirp.sync(path.join(tmpDir, "scripts"));
    fs.closeSync(fs.openSync(path.join(tmpDir, "webpack-assets.json"), "w"));
    run("scripts/hi", (error) => {
      expect(error).to.not.be.undefined;
      done();
    });
  });
});
