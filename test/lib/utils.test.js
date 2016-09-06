/*global afterEach beforeEach describe it*/
import { expect } from "chai";
import sinon from "sinon";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import logger from "../../src/lib/cliLogger";
import { isGluestickProject, quitUnlessGluestickProject, compareVersions } from "../../src/lib/utils";

describe("utils", function () {

  let originalCwd, tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-utils");
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

  describe("quitUnlessGluestickProject", function () {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(process, "exit");
      sandbox.stub(logger, "error");
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

  describe("compareVersions", function () {

    it("returns 1 if the major number of the first arg is greater than the major number of the second arg", () => {
      const versionA = "1.0.0";
      const versionB = "0.0.0";
      expect(compareVersions(versionA, versionB)).to.equal(1);
    });

    it("returns -1 if the major number of the first arg is less than the major number of the second arg", () => {
      const versionA = "0.0.0";
      const versionB = "1.0.0";
      expect(compareVersions(versionA, versionB)).to.equal(-1);
    });

    it("returns 0 if the major number of the first arg equals the major number of the second arg", () => {
      const versionA = "1.0.0";
      const versionB = "1.0.0";
      expect(compareVersions(versionA, versionB)).to.equal(0);
    });

    it("returns -1 if the minor number of the first arg is numerically less than the minor number of the second arg", () => {
      const versionA = "1.8.0";
      const versionB = "1.10.0";
      expect(compareVersions(versionA, versionB)).to.equal(-1);
    });

    it("returns 1 if the minor number of the first arg is numerically greater than the minor number of the second arg", () => {
      const versionA = "1.10.0";
      const versionB = "1.8.0";
      expect(compareVersions(versionA, versionB)).to.equal(1);
    });

    it("returns 1 if the first arg consists of numbers but the second arg doesn't", () => {
      const versionA = "1.0.0";
      const versionB = "abc";
      expect(compareVersions(versionA, versionB)).to.equal(1);
    });

    it("returns -1 if the first arg doesn't consist of numbers but the second arg does", () => {
      const versionA = "abc";
      const versionB = "1.0.0";
      expect(compareVersions(versionA, versionB)).to.equal(-1);
    });

  });

});
