import fs from "fs-extra";
import path from "path";
import temp from "temp";
import { expect } from "chai";
import sinon, { stub } from "sinon";
import logger from "../../src/lib/logger";

import newApp from "../../src/commands/new";
import npmDependencies from "../../src/lib/npmDependencies";
import getWebpackAdditions from "../../src/lib/getWebpackAdditions";

describe("src/lib/getWebpackAdditions", () => {
  let originalCwd, tmpDir, fakeNpm, cwd, webpackAdditionsPath, sandbox;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    fakeNpm = stub(npmDependencies, "install");
    process.chdir(tmpDir);

    newApp("test-app");
    const appDir = path.join(tmpDir, "test-app");
    process.chdir(appDir);
    cwd = process.cwd();
    webpackAdditionsPath = path.join(cwd, "src", "config", "webpack-additions.js");

    // Remove .babelrc so it wont complain about missing react preset
    fs.unlinkSync(path.join(cwd, ".babelrc"));

    sandbox = sinon.sandbox.create();
    sandbox.spy(logger, "info");
    sandbox.spy(logger, "warn");
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(tmpDir);
    fakeNpm.restore();
    sandbox.restore();
  });

  it("logger.warn an error and return default empty additions when there is an error parsing the additions file", () => {
    fs.outputFileSync(webpackAdditionsPath, "PaRSE ErRor");
    expect(logger.warn.called).to.equal(false);
    const result = getWebpackAdditions();
    expect(result).to.deep.equal({
      additionalAliases: {},
      additionalLoaders: [],
      additionalPreLoaders: [],
      entryPoints: {},
      plugins: [],
      vendor: []
    });
    expect(logger.warn.called).to.equal(true);
  });

  it("should return additionalLoaders and additionalPreLoaders when they are specified in webpack-additions", () => {
    const additions = {
      additionalLoaders: [
        {
          extensions: ["xml"],
          loader: "xml-loader"
        },
        {
          extensions: ["todd", "odd", "surf", "turf"],
          loader: "todd-loader"
        }
      ],
      additionalPreLoaders: [
        {
          extensions: ["json"],
          loader: "json-loader"
        }
      ]
    };
    const webpackAdditionsContent = `module.exports = ${JSON.stringify(additions)}`;
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).to.deep.equal({
      additionalAliases: {},
      additionalLoaders: [
        {
          loader: "xml-loader",
          test: /\.xml$/
        },
        {
          loader: "todd-loader",
          test: /\.(todd|odd|surf|turf)$/
        }
      ],
      additionalPreLoaders: [
        {
          loader: "json-loader",
          test: /\.json$/
        }
      ],
      entryPoints: {},
      plugins: [],
      vendor: []
    });
  });

  it("should return entryPoints when they are specified in webpack-additions", () => {
    const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).to.deep.equal({
      additionalAliases: {},
      additionalLoaders: [],
      additionalPreLoaders: [],
      entryPoints: {
        "/used-cars-for-sale": {
          "name": "used"
        }
      },
      plugins: [],
      vendor: []
    });
  });

  // @TODO: Write more tests that validate what happens in `prepareUserAdditionsForWebpack`
});

