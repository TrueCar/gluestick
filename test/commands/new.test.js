/*global afterEach beforeEach describe it*/
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

  let originalCwd, tmpDir;
  logger.info = jest.fn();
  logger.warn = jest.fn();
  npmDependencies.install = jest.fn();
  const fakeNpm = npmDependencies.install;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
  });

  afterEach(done => {
    jest.resetAllMocks();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should report an error if the project name has symbols", () => {
    newApp("foo#$");
    expect(logger.warn.mock.calls[0][0]).toContain("Invalid name");
  });

  it("should prompt the user if a .gluestick file already exists", () => {
    fs.closeSync(fs.openSync(".gluestick", "w"));
    newApp("gs-new-test");
    expect(logger.info.mock.calls[0][0]).toContain("You are about to initialize a new gluestick project");
  });

  it("should copy the contents of `new` upon install", () => {
    newApp("gs-new-test");

    // account for the fact that the gitignore file that gets renamed
    const generatedFiles = new Set(glob.sync("**", { dot: true }));
    const renamedGitFileExists = generatedFiles.delete(".gitignore");
    expect(renamedGitFileExists).toBeTruthy();
    generatedFiles.add("_gitignore");

    expect(newFilesTemplate.filter(f => !generatedFiles.has(f)).length).toBe(0);
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
        expect(index[testFilename]).toEqual(true);
      }
    });
  });

});
