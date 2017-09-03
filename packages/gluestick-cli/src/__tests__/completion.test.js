/* @flow */

jest.mock("fs", () => {
  const _fs = require.requireActual("fs");
  _fs.existsReturn = false;
  _fs.existsSync = function(){ return _fs.existsReturn };
  return _fs;
});
const fs = require("fs");

jest.mock(
  "node_modules/gluestick/package.json",
  () => ( { version: "1.14.0" } ), //enable the check for updated local dependency
  { virtual: true }
);
jest.mock(
  "node_modules/gluestick/build/cli",
  () => ( require("../../../gluestick/src/cli") ),
  { virtual: true }
);

const completion = require("../completion");

const cliTab = (line, cwd = ".") => {
  const argvMimic = line.replace(/^gluestick /,"").trim();
  // console.log("argv mimic:", argvMimic.split(" "));
  return completion.default(cwd, argvMimic ? argvMimic.split(" ") : []);
}

const CLI_COMMANDS = [
  "new",
  "reinstall-dev",
  "reset-hard",
  "watch",
];

const PROJECT_COMMANDS = [
  "auto-upgrade",
  "bin",
  "build",
  "destroy",
  "dockerize",
  "generate",
  "start",
  "start-client",
  "start-server",
  "test",
];

describe("gluestick-cli/src/completion.js", () => {
  it("should be callable", () => {
    completion.default(".", []);
  });

  describe("when CWD is a project with gluestick < 1.14", () => {
    beforeAll(() => {
      const projectPDJ = require("node_modules/gluestick/package.json");
      projectPDJ.version = "1.13";
      fs.existsReturn = true; // ./node_modules/.bin/gluestick exists
    });
    it("should return base commands anyway", () => {
      const options = cliTab("gluestick ");
      expect(options).toEqual(expect.arrayContaining(PROJECT_COMMANDS));
    });
  });
  describe("when CWD is a gluestick project", () => {
    beforeAll(() => {
      const projectPDJ = require("node_modules/gluestick/package.json");
      projectPDJ.version = "1.14";
      completion.reload();
      fs.existsReturn = true; // ./node_modules/.bin/gluestick exists
    });
    it("should return global commands", () => {
      const options = cliTab("gluestick ");
      expect(options).toEqual(PROJECT_COMMANDS);
    });
    it("should return options while typeing the base command", () => {
      const options = cliTab("gluestick s");
      expect(options).toEqual(PROJECT_COMMANDS);
    });
  });

  describe("when CWD is _not_ a gluestick project", () => {
    beforeEach(() => {
      fs.existsReturn = false; // ./node_modules/.bin/gluestick absent
    });
    it("should return project commands", () => {
      const options = cliTab("gluestick ");
      expect(options).toEqual(CLI_COMMANDS);
    });

  });

});
