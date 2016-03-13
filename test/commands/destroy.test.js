import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import path from "path";
import temp from "temp";
import rimraf from "rimraf";
import mkdirp from "mkdirp";
import destroy from "../../src/commands/destroy";


function createFiles(...filePaths) {
  filePaths.map(path => {
    fs.closeSync(fs.openSync(path, "w"));
  });
}

function createDirectories(rootDir, ...directories) {
  directories.map(directory => {
    mkdirp.sync(path.join(rootDir, `/src/${directory}`));
    mkdirp.sync(path.join(rootDir, `/test/${directory}`));
  });
}

describe("cli: gluestick destroy", function () {

  let originalCwd, tmpDir, sandbox;

  const fileExists = filePath => {
    return fs.existsSync(path.join(tmpDir, filePath));
  };

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-destroy");
    process.chdir(tmpDir);

    fs.closeSync(fs.openSync(".gluestick", "w"));
    createDirectories(tmpDir, "components", "reducers", "containers");

    const componentPath = path.join(tmpDir, "/src/components/TestComponent.js");
    const componentTestPath = path.join(tmpDir, "/test/components/TestComponent.test.js");

    const containerPath = path.join(tmpDir, "/src/containers/TestContainer.js");
    const containerTestPath = path.join(tmpDir, "/test/containers/TestContainer.test.js");

    const reducerPath = path.join(tmpDir, "/src/reducers/testReducer.js");
    const reducerTestPath = path.join(tmpDir, "/test/reducers/testReducer.test.js");

    createFiles(componentPath, componentTestPath, containerPath, containerTestPath, reducerPath, reducerTestPath);

    sandbox = sinon.sandbox.create();
    sandbox.spy(console, "log");
    sandbox.spy(console, "error");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should throw an error when (container|component|reducer) is not specified", () => {
    destroy("blah","");
    expect(console.log.calledWithMatch("is not a valid destroy command.")).to.be.true;
  });

  it("should throw an error when a name not specified", () => {
    destroy("component","");
    expect(console.log.calledWithMatch("ERROR: invalid arguments. You must specify a name.")).to.be.true;
  });

  it("should throw an error when the specified name does not exist", () => {
    destroy("component","somethingthatdoesnotexist");
    expect(console.log.calledWithMatch("does not exist")).to.be.true;
  });

  it("should destroy the specified component and its associated test", () => {
    expect(fileExists("/src/components/TestComponent.js")).to.be.true;
    expect(fileExists("/test/components/TestComponent.test.js")).to.be.true;
    destroy("component","TestComponent");
    expect(fileExists("/src/components/TestComponent.js")).to.be.false;
    expect(fileExists("/test/components/TestComponent.test.js")).to.be.false;
  });

  it("should destroy the specified reducer and its associated test", () => {
    expect(fileExists("/src/reducers/testReducer.js")).to.be.true;
    expect(fileExists("/test/reducers/testReducer.test.js")).to.be.true;
    destroy("reducer","testReducer");
    expect(fileExists("/src/reducers/testReducer.js")).to.be.false;
    expect(fileExists("/test/reducers/testReducer.test.js")).to.be.false;
  });

  it("should destroy the specified container and its associated test", () => {
    expect(fileExists("/src/containers/TestContainer.js")).to.be.true;
    expect(fileExists("/test/containers/TestContainer.test.js")).to.be.true;
    destroy("container","TestContainer");
    expect(fileExists("/src/containers/TestContainer.js")).to.be.false;
    expect(fileExists("/test/containers/TestContainer.test.js")).to.be.false;
  });
});
