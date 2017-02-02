import fs from "fs";
import temp from "temp";
import { join } from "path";
import rimraf from "rimraf";

import loadServerConfig from "../../../src/lib/server/loadServerConfig";

describe("lib/server/loadServerConfig", () => {
  let originalCwd, tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    fs.mkdirSync(join(tmpDir, "src"));
    fs.mkdirSync(join(tmpDir, "src", "config"));
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe("when no application.server file exists", () => {
    it("should return an empty object", () => {
      expect(loadServerConfig()).toEqual({});
    });
  });

  describe("when application.server has an object", () => {
    beforeEach(() => {
      fs.writeFileSync("src/config/application.server.js", `
        module.exports = {
          default: {
            assets: {
              headers: {
                maxAge: 1000
              }
            }
          }
        };
      `);
    });

    it("should return the data in application.server", () => {
      expect(loadServerConfig()).toEqual({
        assets: {
          headers: {
            maxAge: 1000
          }
        }
      });
    });
  });
});

