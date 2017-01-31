import fs from "fs-extra";
import path from "path";
import temp from "temp";
import logger from "../../src/lib/cliLogger";

import newApp from "../../src/commands/new";
import getWebpackAdditions from "../../src/lib/getWebpackAdditions";

describe("src/lib/getWebpackAdditions", () => {
  let originalCwd, tmpDir, cwd, webpackAdditionsPath;
  let defaultAdditions;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);

    newApp("test-app");
    const appDir = path.join(tmpDir, "test-app");
    process.chdir(appDir);
    cwd = process.cwd();
    webpackAdditionsPath = path.join(cwd, "src", "config", "webpack-additions.js");

    // Remove .babelrc so it wont complain about missing react preset
    fs.unlinkSync(path.join(cwd, ".babelrc"));

    logger.error = jest.fn();
    logger.info = jest.fn();
    logger.warn = jest.fn();

    defaultAdditions = {
      additionalAliases: {},
      additionalExternals: {},
      additionalLoaders: [],
      additionalWebpackConfig: {},
      entryPoints: {},
      plugins: [],
      vendor: null
    };
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(tmpDir);
    jest.resetAllMocks();
  });

  it("logger.warn an error and return default empty additions when there is an error parsing the additions file", () => {
    fs.outputFileSync(webpackAdditionsPath, "PaRSE ErRor");
    expect(logger.warn).toHaveBeenCalledTimes(0);
    const result = getWebpackAdditions();
    expect(result).toEqual(defaultAdditions);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("should return additionalLoaders when they are specified in webpack-additions", () => {
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
    };
    const webpackAdditionsContent = `module.exports = ${JSON.stringify(additions)}`;
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).toEqual({
      ...defaultAdditions,
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
    });
  });

  it("should return entryPoints when they are specified in webpack-additions", () => {
    const webpackAdditionsContent = "module.exports = { additionalLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).toEqual({
      ...defaultAdditions,
      entryPoints: {
        "/used-cars-for-sale": {
          "name": "used"
        }
      },
    });
  });

  it("should return additionalExternals when they are specified in webpack-additions", () => {
    const additions = {
      ...defaultAdditions,
      additionalExternals: {
        foo: true
      }
    };
    const webpackAdditionsContent = `module.exports = ${JSON.stringify(additions)}`;
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).toEqual({
      ...defaultAdditions,
      ...additions
    });
  });

  it("should return additionalWebpackConfig when they are specified in webpack-additions", () => {
    const additions = {
      ...defaultAdditions,
      additionalWebpackConfig: {
        mish: "kin"
      }
    };
    const webpackAdditionsContent = `module.exports = ${JSON.stringify(additions)}`;
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getWebpackAdditions();
    expect(result).toEqual({
      ...defaultAdditions,
      ...additions
    });
  });
  // @TODO: Write more tests that validate what happens in `prepareUserAdditionsForWebpack`
});
