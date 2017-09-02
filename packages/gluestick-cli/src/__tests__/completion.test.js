/* @flow */

const completion = require("../completion").default;

const cli = (line, cwd = ".") => {
  const argvMimic = line.replace(/^gluestick/,"").trim().split(" ");
  console.log("argv mimick:", argvMimic);
  return completion(cwd, argvMimic);
}

describe("gluestick-cli/src/completion.js", () => {
  it("should be callable", () => {
    completion(".", []);
  });

  it("should return the commands", () => {
    const options = cli("gluestick ");
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
