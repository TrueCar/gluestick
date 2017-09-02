/* @flow */

const completion = require("../completion").default;

const cliTab = (line, cwd = ".") => {
  const argvMimic = line.replace(/^gluestick /,"").trim();
  // console.log("argv mimic:", argvMimic.split(" "));
  return completion(cwd, argvMimic ? argvMimic.split(" ") : []);
}

const CLI_COMMANDS = [
  "new",
  "reinstall-dev",
  "watch",
  "reset-hard",
];

const PROJECT_COMMANDS = [
  "generate",
  "destroy",
  "start",
  "build",
  "bin",
  "dockerize",
  "start-client",
  "start-server",
  "test",
];

describe("gluestick-cli/src/completion.js", () => {
  it("should be callable", () => {
    completion(".", []);
  });

  it("should return the commands", () => {
    const options = cliTab("gluestick ");
    expect(options).toEqual(
      expect.arrayContaining(
        CLI_COMMANDS.concat(PROJECT_COMMANDS).sort()
      )
    );
  });

});
