import { expect } from "chai";
import sinon from "sinon";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import glob from "glob";
import temp from "temp";
import rimraf from "rimraf";
import logger from "../../src/lib/logger";
import { isGluestickProject, quitUnlessGluestickProject } from "../../src/lib/utils";

describe("utils", function () {

  let originalCwd, tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-generate");
    process.chdir(tmpDir);
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe("isGluestickProject", function () {

    it("should return false if a .gluestick file is not found in the current directory", done => {
      expect(isGluestickProject()).to.be.false;
      done();
    });

    it("should return true if a .gluestick file is not found in the current directory", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      expect(isGluestickProject()).to.be.true;
      done();
    });

  });

  describe("isGluestickProject", function () {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(process, "exit");
      sandbox.spy(logger, "error");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should quit the program if run outside of a gluestick project", done => {
      quitUnlessGluestickProject("test");
      expect(process.exit.called).to.be.true;
      done();
    });

    it("should not quit the program if run inside of a gluestick project", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      quitUnlessGluestickProject("test");
      expect(process.exit.called).to.be.false;
      done();
    });


    it("should display an error if run outside of a gluestick project", done => {
      quitUnlessGluestickProject("test");
      expect(logger.error.calledWithMatch("commands must be run from the root of a gluestick project")).to.be.true;
      done();
    });

    it("should not display an error if run inside of a gluestick project", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      quitUnlessGluestickProject("test");
      expect(logger.error.calledWithMatch("commands must be run from the root of a gluestick project")).to.be.false;
      done();
    });

  });

});

