import sinon from "sinon";
import { expect } from "chai";
import fs from "fs";
import temp from "temp";
import rimraf from "rimraf";
import glob from "glob";
import mkdirp from "mkdirp";
import path from "path";
import destroy from "../../src/commands/destroy";
import npmDependencies from "../../src/lib/npm-dependencies";

describe("cli: gluestick destroy", function () {

  let originalCwd, tmpDir, sandbox;
  let componentPath, componentTestPath, containerPath, containerTestPath, reducerPath, reducerTestPath;

  let createFiles = function(...filePaths) {
      console.log(filePaths);
      for(let path of filePaths) {
          fs.closeSync(fs.openSync(path, "w"));
      }
  };
  
  let createDirectories = function(...directories) {
      console.log(directories);
      
      for(let directory of directories) {
        mkdirp.sync(tmpDir + `/src/${directory}`);
        mkdirp.sync(tmpDir + `/test/${directory}`);      
      }
  };
  
  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-destroy");
    process.chdir(tmpDir);
    
    fs.closeSync(fs.openSync(".gluestick", "w"));
    createDirectories('components', 'reducers', 'containers');
    
    componentPath = tmpDir + "/src/components/TestComponent.js";
    componentTestPath = tmpDir + "/test/components/TestComponent.test.js";
    
    containerPath = tmpDir + "/src/containers/TestContainer.js";
    containerTestPath = tmpDir + "/test/containers/TestContainer.test.js";
    
    reducerPath = tmpDir + "/src/reducers/testReducer.js";
    reducerTestPath = tmpDir + "/test/reducers/testReducer.test.js"
    
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
    destroy('blah',''); 
    expect(console.log.calledWithMatch("is not a valid destroy command.")).to.be.true;
  });

  it("should throw an error when a name not specified", () => { 
    destroy("component",""); 
    expect(console.log.calledWithMatch("ERROR: invalid arguments. You must specify a name.")).to.be.true;
  });

  it("should throw ab error when the specified name does not exist", () => { 
    destroy("component","somethingthatdoesnotexist"); 
    expect(console.log.calledWithMatch("does not exist")).to.be.true;
  });

  it("should destroy the specified component and its associated test", () => { 
    expect(fs.existsSync(tmpDir + "/src/components/TestComponent.js")).to.be.true
    expect(fs.existsSync(tmpDir + "/test/components/TestComponent.test.js")).to.be.true
    destroy("component","TestComponent"); 
    expect(fs.existsSync(tmpDir + "/src/components/TestComponent.js")).to.be.false
    expect(fs.existsSync(tmpDir + "/test/components/TestComponent.test.js")).to.be.false
  });

  it("should destroy the specified reducer and its associated test", () => { 
    expect(fs.existsSync(tmpDir + "/src/reducers/testReducer.js")).to.be.true
    expect(fs.existsSync(tmpDir + "/test/reducers/testReducer.test.js")).to.be.true
    destroy("reducer","testReducer"); 
    expect(fs.existsSync(tmpDir + "/src/reducers/testReducer.js")).to.be.false
    expect(fs.existsSync(tmpDir + "/test/reducers/testReducer.test.js")).to.be.false
  });

  it("should destroy the specified container and its associated test", () => { 
    expect(fs.existsSync(tmpDir + "/src/containers/TestContainer.js")).to.be.true
    expect(fs.existsSync(tmpDir + "/test/containers/TestContainer.test.js")).to.be.true
    destroy("container","TestContainer"); 
    expect(fs.existsSync(tmpDir + "/src/containers/TestContainer.js")).to.be.false
    expect(fs.existsSync(tmpDir + "/test/containers/TestContainer.test.js")).to.be.false
  });

});
