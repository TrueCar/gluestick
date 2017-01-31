/* eslint-disable */
// @TODO enable eslint when file is refactored

// import fs from "fs";
// import temp from "temp";
// import rimraf from "rimraf";
// import logger from "../../src/lib/cliLogger";
// import { isGluestickProject, quitUnlessGluestickProject } from "../../src/lib/utils";

// @TODO test should be refactor when utils & logger is refactored
describe.skip("utils", function () {

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
      expect(isGluestickProject()).toBeFalsy();
      done();
    });

    it("should return true if a .gluestick file is not found in the current directory", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      expect(isGluestickProject()).toBeTruthy();
      done();
    });

  });

  describe("quitUnlessGluestickProject", function () {

    process.exit = jest.fn();
    logger.error = jest.fn();

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should quit the program if run outside of a gluestick project", done => {
      quitUnlessGluestickProject("test");
      expect(process.exit).toHaveBeenCalledTimes(1);
      done();
    });

    it("should not quit the program if run inside of a gluestick project", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      quitUnlessGluestickProject("test");
      expect(process.exit).not.toHaveBeenCalled();
      done();
    });


    it("should display an error if run outside of a gluestick project", done => {
      quitUnlessGluestickProject("test");
      expect(logger.error.mock.calls[0][0]).toContain("commands must be run from the root of a gluestick project");
      done();
    });

    it("should not display an error if run inside of a gluestick project", done => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      quitUnlessGluestickProject("test");
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });

  });
});
