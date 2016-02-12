import sinon from "sinon";
import { expect } from "chai";
import temp from "temp";
import rimraf from "rimraf";
import generate from "../../src/commands/generate";

describe("cli: gluestick generate", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-generate");
    process.chdir(tmpDir);
    sandbox = sinon.sandbox.create();
    sandbox.spy(console, "log");
    sandbox.spy(console, "error");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should report an error if a .gluestick file is not found in the current directory", () => { 
    generate("container", "MyContainer");
    expect(console.log.calledWithMatch("ERROR: `generate` commands must be run from the root of a gluestick project.")).to.be.true;
  });

});
