import { expect } from "chai";
import fs from "fs-extra";
import path from "path";
import temp from "temp";
import detectEnvironmentVariables from "../../src/lib/detectEnvironmentVariables";

describe("src/lib/detectEnvironmentVariables", () => {

  let tmpDir, originalCwd, cwd;
  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    cwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(tmpDir);
  });

  it("should detect all process.env variables in a file", () => {
    const data = `export default {
      option: {
        pretty: true,
        verbose: false
      },
      env: process.env.NODE_ENV,
      foo: process.env.FOO,
      bar: process.env.BAR,
      baz: "test"
    };`;
    const filePath = path.join(cwd, "config.js");
    fs.writeFileSync(filePath, data);
    expect(detectEnvironmentVariables(filePath)).to.deep.equal(["NODE_ENV", "FOO", "BAR"]);
  });

  it("should not duplicate any process.env variables found in a file", () => {
    const data = `export default {
      option: {
        pretty: true,
        verbose: false
      },
      env: process.env.NODE_ENV,
      foo: process.env.FOO,
      bar: process.env.BAR,
      baz: "test",
      somethingelse: process.env.NODE_ENV
    };`;
    const filePath = path.join(cwd, "config.js");
    fs.writeFileSync(filePath, data);
    expect(detectEnvironmentVariables(filePath)).to.deep.equal(["NODE_ENV", "FOO", "BAR"]);
  });
});
