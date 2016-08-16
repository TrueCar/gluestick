import fs from "fs-extra";
import path from "path";
import temp from "temp";
import { expect } from "chai";
import { stub, spy } from "sinon";

import newApp from "../../../src/commands/new";
import npmDependencies from "../../../src/lib/npmDependencies";

import getRenderRequirementsFromEntrypoints from "../../../src/lib/server/getRenderRequirementsFromEntrypoints";

const MOCK_REQUEST = {
  headers: {
    host: "localhost:8888"
  }
};

describe("src/lib/server/getRenderRequirementsFromEntrypoints", () => {
  let originalCwd, tmpDir, fakeNpm, cwd, webpackAdditionsPath, mockServerResponse;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    fakeNpm = stub(npmDependencies, "install");
    process.chdir(tmpDir);

    mockServerResponse = {
      append: spy()
    };

    newApp("test-app");
    const appDir = path.join(tmpDir, "test-app");
    process.chdir(appDir);
    cwd = process.cwd();
    webpackAdditionsPath = path.join(cwd, "src", "config", "webpack-additions.js");

    // Remove .babelrc so it wont complain about missing react preset
    fs.unlinkSync(path.join(cwd, ".babelrc"));
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.removeSync(tmpDir);
    fakeNpm.restore();
  });

  it("return the default data if no entry points are defined no matter what the path", () => {
    const mockRequire = (path) => ({
      getStore: () => `getStore: ${path}`,
      default: `Contents of ${path}`
    });
    const request = { ...MOCK_REQUEST, url: "http://kook.com/todd" };
    const result = getRenderRequirementsFromEntrypoints(request, {}, mockServerResponse, mockRequire);
    const expectedResult = {
      Index: `Contents of ${cwd}/Index.js`,
      fileName: "main",
      getRoutes: `Contents of ${cwd}/src/config/routes`,
      store: `getStore: ${cwd}/src/config/.entries/main-[chunkhash].js`
    };
    expect(result).to.deep.equal(expectedResult);
  });

  it("return the default data if no entry points are defined no matter what the path", () => {
    const mockRequire = (path) => ({
      getStore: () => `getStore: ${path}`,
      default: `Contents of ${path}`
    });
    const request = { ...MOCK_REQUEST, url: "http://kook.com/used-cars-for-sale" };
    const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
    fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
    const result = getRenderRequirementsFromEntrypoints(request, {}, mockServerResponse, mockRequire);
    const expectedResult = {
      Index: `Contents of ${cwd}/Index.js`,
      fileName: "used",
      getRoutes: `Contents of ${cwd}/src/config/routes/used`,
      store: `getStore: ${cwd}/src/config/.entries/used-[chunkhash].js`
    };
    expect(result).to.deep.equal(expectedResult);
  });
});

