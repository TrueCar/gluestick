/* @flow */

jest.mock("fs", () => {
  const _fs = require.requireActual("fs");
  _fs.existsReturn = false;
  _fs.existsSync = function(){ return _fs.existsReturn };
  return _fs;
});
const fs = require("fs");
const completion = require("../completion").default;

const cliTab = (line, cwd = ".") => {
  const argvMimic = line.replace(/^gluestick /,"").trim();
  // console.log("argv mimic:", argvMimic.split(" "));
  return completion(cwd, argvMimic ? argvMimic.split(" ") : []);
}

const CLI_COMMANDS = [
  "new",
  "reinstall-dev",
  "reset-hard",
  "watch",
];

const PROJECT_COMMANDS = [
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
    completion(".", []);
  });

  describe("when CWD is a gluestick project", () => {
    beforeEach(() => {
      fs.existsReturn = true; // ./node_modules/.bin/gluestick exists
    });
    it("should return global commands", () => {
      const options = cliTab("gluestick ");
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
