import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import generate from "../../src/commands/generate";

describe("cli: gluestick generate", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-generate");
    process.chdir(tmpDir);
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should report an error if a .gluestick file is not found in the current directory", () => { 
    generate("container", "MyContainer", (err) => {
      expect(err).to.contain("commands must be run from the root of a gluestick project");
    });
  });

  it("should report an error if an invalid command type was provided", () => {
    fs.closeSync(fs.openSync(".gluestick", "w"));
    generate("invalidtype", "myname", (err) => {
      expect(err).to.contain("is not a valid generator");
    });
  });

  it("should report an error if a blank name is provided", () => {
    fs.closeSync(fs.openSync(".gluestick", "w"));
    generate("container", "", (err) => {
      expect(err).to.contain("must specify a name");
    });
  });

  it("should report an error if non-word characters are in the name", () => {
    fs.closeSync(fs.openSync(".gluestick", "w"));
    generate("container", "f##@", (err) => {
      expect(err).to.contain("is not a valid name");
    });
  });

});
