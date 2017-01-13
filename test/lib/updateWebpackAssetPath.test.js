import temp from "temp";
import rimraf from "rimraf";
import fs from "fs";
import path from "path";
import { mkdir } from "shelljs";

import updateWebpackAssetPath from "../../src/lib/updateWebpackAssetPath";
import { expect } from "chai";

const ASSETS_STRING = JSON.stringify({
  "assets" : {
    "__GS_ASSET_URL__/assets/css/normalize.css" : "body { background: #f0f; }"
  },
  "javascript" : {
    "main" : "__GS_ASSET_URL__/main-app-c03464f0dd92831dad2e.bundle.js",
    "vendor" : "__GS_ASSET_URL__/vendor-d716f60633c7f6c46235.bundle.js"
  },
  "styles" : {
    "main" : "__GS_ASSET_URL__/main-c03464f0dd92831dad2e.css"
  }
});

describe("lib/updateWebpackAssetPath", () => {
  let originalCwd, tmpDir, buildFolder;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync("gluestick-new");
    process.chdir(tmpDir);
    buildFolder = path.join(process.cwd(), "build");
    mkdir(buildFolder);
  });

  afterEach(done => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it("should save the underscore backup version if one doesn't exist", () => {
    fs.writeFileSync(path.join(process.cwd(), "webpack-assets.json"), ASSETS_STRING);

    const originalFilePath = path.join(process.cwd(), "_webpack-assets.json");
    expect(() => fs.statSync(originalFilePath)).to.throw("ENOENT");
    updateWebpackAssetPath("http://www.assetsformybaskets.com/assets");
    expect(() => fs.statSync(originalFilePath)).to.not.throw("ENOENT");
  });

  it("should read from and not update the underscored backup if it does exist", () => {
    const filePath = path.join(process.cwd(), "webpack-assets.json");
    const originalFilePath = path.join(process.cwd(), "_webpack-assets.json");

    fs.writeFileSync(path.join(process.cwd(), "webpack-assets.json"), ASSETS_STRING);
    fs.writeFileSync(originalFilePath, "{\"test\": \"__GS_ASSET_URL__/test.jpg\"}");

    updateWebpackAssetPath("http://www.assetsformybaskets.com/assets");

    expect(fs.readFileSync(originalFilePath, "utf8")).to.equal("{\"test\": \"__GS_ASSET_URL__/test.jpg\"}");
    expect(fs.readFileSync(filePath, "utf8")).to.equal("{\"test\": \"http://www.assetsformybaskets.com/assets/test.jpg\"}");
  });

  it("should replace `__GS_ASSET_URL__` with new assetUrl", () => {
    const filePath = path.join(process.cwd(), "webpack-assets.json");

    fs.writeFileSync(filePath, ASSETS_STRING);

    updateWebpackAssetPath("http://www.assetsformybaskets.com/assets");

    const result = fs.readFileSync(filePath, "utf8");
    expect(result).to.equal("{\"assets\":{\"http://www.assetsformybaskets.com/assets/assets/css/normalize.css\":\"body { background: #f0f; }\"},\"javascript\":{\"main\":\"http://www.assetsformybaskets.com/assets/main-app-c03464f0dd92831dad2e.bundle.js\",\"vendor\":\"http://www.assetsformybaskets.com/assets/vendor-d716f60633c7f6c46235.bundle.js\"},\"styles\":{\"main\":\"http://www.assetsformybaskets.com/assets/main-c03464f0dd92831dad2e.css\"}}");
  });

  it("should replace `__GS_ASSET_URL__` in the build folder", () => {
    const filePath = path.join(buildFolder, "test.css");

    fs.writeFileSync(path.join(process.cwd(), "webpack-assets.json"), ASSETS_STRING);
    fs.writeFileSync(filePath, "body { background: url(__GS_ASSET_URL__/tacos.jpg); }");

    updateWebpackAssetPath("http://www.assetsformybaskets.com/assets");

    const result = fs.readFileSync(filePath, "utf8");
    expect(result).to.equal("body { background: url(http://www.assetsformybaskets.com/assets/tacos.jpg); }");
  });
});

