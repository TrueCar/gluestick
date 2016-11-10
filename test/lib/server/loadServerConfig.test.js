import sinon from "sinon";
import fs from "fs";
import temp from "temp";
import { join } from "path";
import rimraf from "rimraf";
import { expect } from "chai";

import loadServerConfig from "../../../src/lib/server/loadServerConfig";

describe("lib/server/loadServerConfig", () => {
  let originalCwd, tmpDir, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    fs.mkdirSync(join(tmpDir, "src"));
    fs.mkdirSync(join(tmpDir, "src", "config"));
    sandbox = sinon.sandbox.create();
  });

  afterEach(done => {
    sandbox.restore();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  context("when no application.server file exists", () => {
    it("should return an empty object", () => {
      expect(loadServerConfig()).to.deep.equal({});
    });
  });

  context("when application.server has an object", () => {
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
      expect(loadServerConfig()).to.deep.equal({
        assets: {
          headers: {
            maxAge: 1000
          }
        }
      });
    });
  });
});

