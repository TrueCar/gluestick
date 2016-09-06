/*global afterEach beforeEach describe it*/
import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import glob from "glob";
import path from "path";
import newApp from "../../src/commands/new";
import npmDependencies from "../../src/lib/npmDependencies";
import logger from "../../src/lib/cliLogger";

const newFilesTemplate = glob.sync("**", {
  cwd: path.resolve("./templates/new"),
  dot: true
});

describe("cli: gluestick new", function () {

  let originalCwd, tmpDir, sandbox, fakeNpm;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    fakeNpm = sinon.stub(npmDependencies, "install");
    sandbox = sinon.sandbox.create();
    sandbox.stub(logger, "info");
    sandbox.stub(logger, "warn");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
    fakeNpm.restore();
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
    newApp("gs-new-test");

    // account for the fact that the gitignore file that gets renamed
    const generatedFiles = new Set(glob.sync("**", { dot: true }));
    const renamedGitFileExists = generatedFiles.delete(".gitignore");
    expect(renamedGitFileExists).to.be.true;
    generatedFiles.add("_gitignore");

    expect(newFilesTemplate.filter(f => !generatedFiles.has(f))).to.be.empty;
  });

  it("should generate a test for all of the initial components and containers", () => {
    newApp("gs-new-test");

    const generatedFiles = new Set(glob.sync("**", { dot: true }));

    // create index from array so we can quickly lookup files by name
    const index = {};
    generatedFiles.forEach((file) => {
      index[file] = true;
    });

    // loop through and make sure components and containers all have tests
    // written for them. This will help us catch if we add a component or
    // container but we do not add a test.
    generatedFiles.forEach((file) => {
      if (/^src\/(components|containers).*\.js$/.test(file)) {
        const testFilename = file.replace(/^src\/(.*)\.js$/, "test/$1\.test\.js");
        expect(index[testFilename]).to.be.true;
      }
    });
  });

});
