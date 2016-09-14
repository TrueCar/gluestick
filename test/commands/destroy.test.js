/*global afterEach beforeEach describe it*/
import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import temp from "temp";
import rimraf from "rimraf";
import mkdirp from "mkdirp";
import logger from "../../src/lib/cliLogger";
import destroy from "../../src/commands/destroy";


function createFiles(...filePaths) {
  filePaths.map(path => {
    fs.closeSync(fs.openSync(path, "w"));
  });
}

function createDirectories(rootDir, ...directories) {
  directories.map(directory => {
    mkdirp.sync(path.join(rootDir, "src", directory));
    mkdirp.sync(path.join(rootDir, "test", directory));
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

    sandbox = sinon.sandbox.create();
    sandbox.stub(logger, "error");
    sandbox.stub(logger, "info");
    sandbox.stub(logger, "success");
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe("when files are generated without sub-directories", function() {
    beforeEach(() => {
      const componentPath = path.join(tmpDir, "src/components/TestComponent.js");
      const componentTestPath = path.join(tmpDir, "test/components/TestComponent.test.js");
      const containerPath = path.join(tmpDir, "src/containers/TestContainer.js");
      const containerTestPath = path.join(tmpDir, "test/containers/TestContainer.test.js");
      const reducerPath = path.join(tmpDir, "src/reducers/testReducer.js");
      const reducerTestPath = path.join(tmpDir, "test/reducers/testReducer.test.js");
      createFiles(componentPath, componentTestPath, containerPath, containerTestPath, reducerPath, reducerTestPath);
    });

    describe("when invalid arguments are provided", function() {
      it("reports an error when (container|component|reducer) is not specified", () => {
        destroy("blah","");
        expect(logger.error.calledWithMatch("is not a valid destroy command.")).to.be.true;
      });

      it("reports an error when a name not specified", () => {
        destroy("component","");
        expect(logger.error.calledWithMatch("invalid arguments. You must specify a name.")).to.be.true;
      });

      it("reports an error when a name only consists of whitespace", () => {
        destroy("component"," ");
        expect(logger.error.calledWithMatch("is not a valid name.")).to.be.true;
      });

      it("reports an error when the specified name does not exist", () => {
        destroy("component","somethingthatdoesnotexist");
        expect(logger.error.calledWithMatch("does not exist")).to.be.true;
      });

      it("should ask whether to continue if the name does not match (case sensitive)", done => {
        sandbox.stub(inquirer, "prompt", (questions, cb) => {
          setTimeout(() => {
            cb({confirm: true});
          }, 0);
        });
        destroy("component","testComponent");
        expect(inquirer.prompt.called).to.be.true;
        done();
      });
    });

    describe("when removing files", function() {
      it("removes the specified component and its associated test", () => {
        expect(fileExists("src/components/TestComponent.js")).to.be.true;
        expect(fileExists("test/components/TestComponent.test.js")).to.be.true;
        destroy("component","TestComponent");
        expect(fileExists("src/components/TestComponent.js")).to.be.false;
        expect(fileExists("test/components/TestComponent.test.js")).to.be.false;
      });

      it("removes the specified reducer and its associated test", () => {
        expect(fileExists("src/reducers/testReducer.js")).to.be.true;
        expect(fileExists("test/reducers/testReducer.test.js")).to.be.true;
        destroy("reducer","testReducer");
        expect(fileExists("src/reducers/testReducer.js")).to.be.false;
        expect(fileExists("test/reducers/testReducer.test.js")).to.be.false;
      });

      it("removes the specified container and its associated test", () => {
        expect(fileExists("src/containers/TestContainer.js")).to.be.true;
        expect(fileExists("test/containers/TestContainer.test.js")).to.be.true;
        destroy("container","TestContainer");
        expect(fileExists("src/containers/TestContainer.js")).to.be.false;
        expect(fileExists("test/containers/TestContainer.test.js")).to.be.false;
      });
    });
  });

  describe("when sub-directories are provided", function() {
    beforeEach(() => {
      createDirectories(tmpDir, path.join("components", "mydirectory"));
      const componentPath = path.join(tmpDir, "src/components/mydirectory/TestComponent.js");
      const componentTestPath = path.join(tmpDir, "test/components/mydirectory/TestComponent.test.js");
      createFiles(componentPath, componentTestPath);
    });

    it("removes the files under the directory", () => {
      expect(fileExists("src/components/mydirectory/TestComponent.js")).to.be.true;
      expect(fileExists("test/components/mydirectory/TestComponent.test.js")).to.be.true;
      destroy("component", "mydirectory/TestComponent");
      expect(logger.error.called).to.be.false;
      expect(fileExists("src/components/mydirectory/TestComponent.js")).to.be.false;
      expect(fileExists("test/components/mydirectory/TestComponent.test.js")).to.be.false;
    });
  });
});
