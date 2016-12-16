/*global afterEach beforeEach describe it*/
import { expect } from "chai";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import glob from "glob";
import temp from "temp";
import rimraf from "rimraf";
import sinon from "sinon";
import logger from "../../src/lib/cliLogger";
import generate from "../../src/commands/generate";

function stubProject(type) {
    // Generate files that are already expected to exist
  const srcDir = path.join(process.cwd(), `src/${type}s`);
  fs.closeSync(fs.openSync(".gluestick", "w"));
  mkdirp.sync(srcDir);
  if (type === "reducer") {
    fs.closeSync(fs.openSync(path.join(srcDir, "index.js"), "w"));
  }
}

function makeGeneratedFilesAssertion(dir, type, name, done) {
  const expectedFiles = [
    ".gluestick",
    "src",
    `src/${type}s`,
    `src/${type}s/${name}.js`,
    "test",
    `test/${type}s`,
    `test/${type}s/${name}.test.js`
  ];
  const generatedFiles = new Set(glob.sync("**", {
    dot: true,
    cwd: path.resolve(dir)
  }));
  const missingFiles = expectedFiles.filter(f => !generatedFiles.has(f));
  // Use an empty array here rather than `be.empty` so that
  // any missing files will be printed during test failures
  expect(missingFiles).to.deep.equal([]);
  done();
}

function assertImportPath(filePath, expectedPath) {
  const importLineRegex = /^import\s+\{?\s*(\w+)\s*\}?\s+from\s+\"([\w\/]+)\"/;
  const types = ["container", "reducer", "component"];

  let matchFound = false;
  fs.readFileSync(filePath, "utf8").split("\n").forEach(line => {
    const match = line.match(importLineRegex);
    if (match !== null && types.some(c => match[0].includes(c))) {
      matchFound = true;
      expect(match[2]).to.equal(expectedPath);
    }
  });

  if (!matchFound) {
    expect.fail();
  }
}

describe("cli: gluestick generate", function () {

  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-generate");
    process.chdir(tmpDir);

    // Prevent verbose output in tests
    sandbox = sinon.sandbox.create();
    sandbox.stub(logger, "info");
    sandbox.stub(logger, "success");
  });

  afterEach((done) => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe("when invalid arguments are provided", function () {
    it("reports an error if an invalid command type was provided", () => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      generate("invalidtype", "myname", {}, (err) => {
        expect(err).to.contain("is not a valid generator");
      });
    });

    it("reports an error if a blank name is provided", () => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      generate("container", "", {}, (err) => {
        expect(err).to.contain("must specify a name");
      });
    });

    it("reports an error if non-word characters are in the name", () => {
      fs.closeSync(fs.openSync(".gluestick", "w"));
      generate("container", "f##@", {}, (err) => {
        expect(err).to.contain("is not a valid name");
      });
    });
  });

  describe("when file names are created", function () {
    it("capitalizes the first letter of the name if the type is `container`", done => {
      const type = "container";
      stubProject(type);
      generate(type, "mycontainer", {}, (err) => {
        expect(err).to.be.undefined;
        makeGeneratedFilesAssertion(process.cwd(), type, "Mycontainer", done);
      });
    });

    it("capitalizes the first letter of the name if the type is `component`", done => {
      const type = "component";
      stubProject(type);
      generate(type, "mycomponent", {}, (err) => {
        expect(err).to.be.undefined;
        makeGeneratedFilesAssertion(process.cwd(), type, "Mycomponent", done);
      });
    });

    it("lowercases the first letter of the name if the type is `reducer`", done => {
      const type = "reducer";
      stubProject(type);
      generate(type, "Myreducer", {}, (err) => {
        expect(err).to.be.undefined;
        makeGeneratedFilesAssertion(process.cwd(), type, "myreducer", done);
      });
    });
  });

  describe("when components are generated", function(){
    const type = "component";
    it("makes a stateless functional component if the 'functional' option is provided", done => {
      stubProject(type);
      generate(type, "mycomponent", {functional: true}, () => {
        const contents = fs.readFileSync(path.join(process.cwd(), `src/${type}s/Mycomponent.js`), "utf8");
        expect(contents).to.contain("export default function Mycomponent ()");
        done();
      });
    });
    it("makes a normal component with no options present", done => {
      stubProject(type);
      generate(type, "mycomponent", {}, () => {
        const contents = fs.readFileSync(path.join(process.cwd(), `src/${type}s/Mycomponent.js`), "utf8");
        expect(contents).to.contain("export default class Mycomponent extends Component");
        done();
      });
    });
  });

  describe("when containers are generated", function () {
    it("does not generate a container if it already exists", done => {
      const type = "container";
      stubProject(type);
      fs.closeSync(fs.openSync(path.join(process.cwd(), `src/${type}s/Mycontainer.js`), "w"));
      generate(type, "mycontainer", {}, (err) => {
        expect(err).to.not.be.undefined;
        expect(err).to.contain("already exists");
        done();
      });
    });

    it("generates a container that sets the document title", done => {
      const type = "container";
      stubProject(type);
      generate(type, "mycontainer", {}, () => {
        const contents = fs.readFileSync(path.join(process.cwd(), `src/${type}s/Mycontainer.js`), "utf8");
        expect(contents).to.contain("<Helmet title=\"Mycontainer\"/>");
        done();
      });
    });
  });

  describe("when reducers are generated", function () {
    it("references the correct import path within reducer tests", done => {
      const type = "reducer";
      const testFilePath = path.join(tmpDir, "test", "reducers", "myreducer.test.js");
      stubProject(type);
      generate(type, "myreducer", {}, (err) => {
        expect(err).to.be.undefined;
        assertImportPath(testFilePath, `${type}s/myreducer`);
        done();
      });
    });
  });

  describe("when directories are provided", function () {
    it("creates the generated component inside a specified directory", done => {
      const type = "component";
      stubProject(type);
      generate(type, "common/mycontainer", {}, (err) => {
        expect(err).to.be.undefined;
        makeGeneratedFilesAssertion(process.cwd(), type, "common/Mycontainer", done);
      });
    });

    it("creates the generated container inside a specified directory n levels deep", done => {
      const type = "container";
      stubProject(type);
      generate(type, "path/to/my/directory/mycontainer", {}, (err) => {
        expect(err).to.be.undefined;
        makeGeneratedFilesAssertion(process.cwd(), type, "path/to/my/directory/Mycontainer", done);
      });
    });

    it("reports an error if directories are provided for reducers", done => {
      const type = "reducer";
      stubProject(type);
      generate(type, "common/myreducer", {}, (err) => {
        expect(err).to.not.be.undefined;
        done();
      });
    });

    it("reports an error if the directory path resolves outside of the root path", done => {
      const type = "component";
      stubProject(type);
      generate(type, "../common/mycomponent", {}, (err) => {
        expect(err).to.not.be.undefined;
        expect(err).to.contain("not supported");
        done();
      });
    });

    it("references the correct import path within component tests", done => {
      const type = "component";
      const testFilePath = path.join(tmpDir, "test", "components", "common", "Mycomponent.test.js");
      stubProject(type);
      generate(type, "common/mycomponent", {}, (err) => {
        expect(err).to.be.undefined;
        assertImportPath(testFilePath, `${type}s/common/Mycomponent`);
        done();
      });
    });

    it("references the correct (resolved) import path within container tests", done => {
      const type = "container";
      const testFilePath = path.join(tmpDir, "test", "containers", "common", "Mycontainer.test.js");
      stubProject(type);
      generate(type, "../containers/common/mycontainer", {}, (err) => {
        expect(err).to.be.undefined;
        assertImportPath(testFilePath, `${type}s/common/Mycontainer`);
        done();
      });
    });
  });

});
