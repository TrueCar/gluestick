import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import glob from "glob";
import path from "path";
import newApp from "../../src/commands/new";
import npmDependencies from "../../src/lib/npm-dependencies";
import logger from "../../src/lib/logger";

const newFilesTemplate = glob.sync("**", {
  cwd: path.resolve("./new"),
  dot: true
});

describe("cli: gluestick new", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    sandbox = sinon.sandbox.create();
    sandbox.spy(logger, "info");
    sandbox.spy(logger, "warn");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should report an error if the project name has symbols", () => { 
    newApp("foo#$"); 
    expect(logger.warn.calledWithMatch("Invalid name")).to.be.true;
  });

  it("should prompt the user if a .gluestick file already exists", () => {
    fs.closeSync(fs.openSync(".gluestick", "w"));
    newApp("gs-new-test"); 
    expect(logger.info.calledWithMatch("You are about to initialize a new gluestick project")).to.be.true;
  });

  it("should copy the contents of `new` upon install", () => {
    const fakeNpm = sinon.stub(npmDependencies, "install");
    try {
      newApp("gs-new-test"); 

      // account for the fact that the gitignore file that gets renamed
      const generatedFiles = new Set(glob.sync("**", { dot: true }));
      const renamedGitFileExists = generatedFiles.delete(".gitignore");
      expect(renamedGitFileExists).to.be.true;
      generatedFiles.add("_gitignore");

      expect(newFilesTemplate.filter(f => !generatedFiles.has(f))).to.be.empty;
    }
    finally {
      fakeNpm.restore();
    }
  });

});
