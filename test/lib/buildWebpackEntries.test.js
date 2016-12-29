import fs from "fs-extra";
import path from "path";
import temp from "temp";
import { expect } from "chai";
import { stub } from "sinon";

import newApp from "../../src/commands/new";
import npmDependencies from "../../src/lib/npmDependencies";

import buildWebpackEntries, { getWebpackEntries } from "../../src/lib/buildWebpackEntries";

describe("src/lib/buildWebpackEntries", () => {
  let originalCwd, tmpDir, fakeNpm, cwd, webpackAdditionsPath;

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
  });

  afterEach((done) => {
    process.chdir(originalCwd);
    fs.remove(tmpDir, done);
    fakeNpm.restore();
  });

  describe("getWebpackEntries", () => {
    it("should return entries for the `main` entry in a brand new project", () => {
      const entries = getWebpackEntries();
      const expectedResult = {
        "/":
          { name: "main",
            routes: `${cwd}/src/config/routes`,
            reducers: `${cwd}/src/reducers`,
            fileName: "main",
            filePath: `${cwd}/src/config/.entries/main-[chunkhash].js`,
            index: `${cwd}/Index`
        }
      };

      expect(entries).to.deep.equal(expectedResult);
    });

    it("should return entries for entryPoints added through the webpack additions file", () => {
      const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
      fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
      const entries = getWebpackEntries();
      const expectedResult = {
        "/": {
          fileName: "main",
          filePath: `${cwd}/src/config/.entries/main-[chunkhash].js`,
          index: `${cwd}/Index`,
          name: "main",
          reducers: `${cwd}/src/reducers`,
          routes: `${cwd}/src/config/routes`
        },
        "/used-cars-for-sale": {
          fileName: "used",
          filePath: `${cwd}/src/config/.entries/used-[chunkhash].js`,
          index: `${cwd}/Index`,
          name: "used",
          reducers: `${cwd}/src/reducers/used`,
          routes: `${cwd}/src/config/routes/used`
        }
      };

      expect(entries).to.deep.equal(expectedResult);
    });

    it("should allow you to override routes, reducers and index path in an entry point", () => {
      const routesPath = "/test/routes";
      const reducersPath = "/test/reducers";
      const indexPath = "/test/UsedIndex.js";
      const webpackAdditionsContent = `module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used', routes: '${routesPath}', reducers: '${reducersPath}', index: '${indexPath}'}}};`;
      fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
      const entries = getWebpackEntries();

      const expectedResult = {
        fileName: "used",
        filePath: `${cwd}/src/config/.entries/used-[chunkhash].js`,
        index: indexPath,
        name: "used",
        reducers: reducersPath,
        routes: routesPath
      };

      expect(entries["/used-cars-for-sale"]).to.deep.equal(expectedResult);
    });
  });

  describe("buildWebpackEntries", () => {
    it("should create necessary entry files", () => {
      const entriesFolder = path.join(cwd, "src", "config", ".entries");
      const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
      const mainEntryPath = path.join(entriesFolder, "main-[chunkhash].js");
      const usedEntryPath = path.join(entriesFolder, "used-[chunkhash].js");
      fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
      expect(() => fs.statSync(mainEntryPath)).to.throw("ENOENT");
      expect(() => fs.statSync(usedEntryPath)).to.throw("ENOENT");
      buildWebpackEntries();
      expect(() => fs.statSync(mainEntryPath)).to.not.throw("ENOENT");
      expect(() => fs.statSync(usedEntryPath)).to.not.throw("ENOENT");
    });

    it("should return a webpack compatible entry object with hot module middleware and our base client code for each entry in dev mode", () => {
      const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
      fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
      const output = buildWebpackEntries();
      const clientPath = path.join(__dirname, "..", "..", "src", "entrypoints", "client.js");
      const eventSourcePolyfillPath = path.join(__dirname, "..", "..", "node_modules", "eventsource-polyfill");
      const expectedResult = {
        "main": [
          eventSourcePolyfillPath,
          "webpack-hot-middleware/client",
          clientPath,
          path.join(cwd, "/src/config/.entries/main-[chunkhash].js")
        ],
        "used": [
          eventSourcePolyfillPath,
          "webpack-hot-middleware/client",
          clientPath,
          path.join(cwd, "/src/config/.entries/used-[chunkhash].js")
        ]
      };
      expect(output).to.deep.equal(expectedResult);
    });

    it("should not include the hot module middleware in production mode", () => {
      const webpackAdditionsContent = "module.exports = { additionalLoaders: [], additionalPreLoaders: [], entryPoints: {'/used-cars-for-sale': { name: 'used'}}};";
      fs.outputFileSync(webpackAdditionsPath, webpackAdditionsContent);
      const output = buildWebpackEntries(/*isProduction*/true);
      const clientPath = path.join(__dirname, "..", "..", "src", "entrypoints", "client.js");
      const expectedResult = {
        "main": [
          clientPath,
          path.join(cwd, "/src/config/.entries/main-[chunkhash].js")
        ],
        "used": [
          clientPath,
          path.join(cwd, "/src/config/.entries/used-[chunkhash].js")
        ]
      };
      expect(output).to.deep.equal(expectedResult);
    });
  });
});

