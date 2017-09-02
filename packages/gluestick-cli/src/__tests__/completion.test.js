/* @flow */

const completion = require("../completion").default;

const cliTab = (line, cwd = ".") => {
  const argvMimic = line.replace(/^gluestick /,"").trim();
  // console.log("argv mimic:", argvMimic.split(" "));
  return completion(cwd, argvMimic ? argvMimic.split(" ") : []);
}

describe("gluestick-cli/src/completion.js", () => {
  it("should be callable", () => {
    completion(".", []);
  });

  it("should return the commands", () => {
    const options = cliTab("gluestick ");
    expect(options).toEqual(expect.arrayContaining([
      "build",
      "destroy",
      "dockerize",
      "generate",
      "new",
      "reinstall-dev",
      "reset-hard",
      "start",
      "start-client",
      "start-server",
      "test",
    ]));
  });

});
