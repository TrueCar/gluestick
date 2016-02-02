import sinon from "sinon";
import { expect } from "chai";
import newApp from "../../src/commands/new";
import temp from "temp";
import rimraf from "rimraf";
import chalk from "chalk";

describe("cli: gluestick new", function () {

  let originalCwd, tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should complain if an invalid project name is provided", done => { 
    const sandbox = sinon.sandbox.create();
    sandbox.stub(console, "log");
    sandbox.stub(console, "error");
    try {
      newApp("foo#$"); 
      expect(console.log.getCall(0).args[0]).to.contain("Invalid name: foo#$");
    }
    finally {
      sandbox.restore();
    }
    done();
  });

});
