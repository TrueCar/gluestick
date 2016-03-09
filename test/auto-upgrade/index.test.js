import { expect } from "chai";
import sinon from "sinon";
import temp from "temp";
import rimraf from "rimraf";
import logger from "../../src/lib/logger";
import autoUpgrade from "../../src/auto-upgrade";

describe("cli: gluestick auto-upgrade", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-auto-upgrade");
    process.chdir(tmpDir);
    sandbox = sinon.sandbox.create();
    sandbox.spy(logger, "warn");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should report an error if a .gluestick file is not found in the current directory", async function(done) {
    try {
      const result = await autoUpgrade();
      expect(result.message).to.equal("commands must be run from the root of a gluestick project");
      done();
    } catch (err) {
      done(err);
    }
  });

});
