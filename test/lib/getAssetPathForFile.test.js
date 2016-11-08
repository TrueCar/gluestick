import { expect } from "chai";
import getAssetPathForFile from "../../src/lib/getAssetPathForFile.js";

describe("lib/getAssetPathForFile", () => {
  const WEBPACK_ASSETS = {
    javascript: {
      "default": "/assets/default-chunk-app-63a1352e709f56fa9274.bundle.js",
      "main": "/assets/main-app-8ec5dba463cc8f7a38e2.bundle.js"
    },
    styles: {
      "vendor": "/assets/vendor-caae0456842614ac670e.css",
      "main": "/assets/main-8ec5dba463cc8f7a38e2.css"
    },
    assets: {
      "./assets/img/logo.png": "/assets/logo-0c9589cb57d3f36c1633353f3fd27185.png"
    },
    path: "/assets/"
  };

  context("when assetPath is the default `/assets` override is set", () => {
    it("should return the asset path for a file listed in the javascript section", () => {
      const result = getAssetPathForFile("main", "javascript", WEBPACK_ASSETS);
      expect(result).to.equal(WEBPACK_ASSETS.javascript.main);

      // production should be the same
      const prodResult = getAssetPathForFile("main", "javascript", WEBPACK_ASSETS, true);
      expect(prodResult).to.equal(result);
    });

    it("should return the asset path for a file listed in the styles section", () => {
      const result = getAssetPathForFile("main", "styles", WEBPACK_ASSETS);
      expect(result).to.equal(WEBPACK_ASSETS.styles.main);

      // production should be the same
      const prodResult = getAssetPathForFile("main", "styles", WEBPACK_ASSETS, true);
      expect(prodResult).to.equal(result);
    });

    it("should return the asset path for a file listed in the assets section", () => {
      const img = "./assets/img/logo.png";
      const result = getAssetPathForFile(img, "assets", WEBPACK_ASSETS);
      expect(result).to.equal(WEBPACK_ASSETS.assets[img]);

      // production should be the same
      const prodResult = getAssetPathForFile(img, "assets", WEBPACK_ASSETS, true);
      expect(prodResult).to.equal(result);
    });
  });

  context("when config exports a different assetPath than `/assets`", () => {
    const config = {
      assetPath: "http://www.example.com/a$$ets"
    };

    it("should return the asset path for a file listed in the javascript section", () => {
      const result = getAssetPathForFile("main", "javascript", WEBPACK_ASSETS, true, config);
      expect(result).to.equal("http://www.example.com/a$$ets/main-app-8ec5dba463cc8f7a38e2.bundle.js");
    });

    it("should return the asset path for a file listed in the styles section", () => {
      const result = getAssetPathForFile("main", "styles", WEBPACK_ASSETS, true, config);
      expect(result).to.equal("http://www.example.com/a$$ets/main-8ec5dba463cc8f7a38e2.css");
    });

    it("should return the asset path for a file listed in the assets section", () => {
      const img = "./assets/img/logo.png";
      const result = getAssetPathForFile(img, "assets", WEBPACK_ASSETS, true, config);
      expect(result).to.equal("http://www.example.com/a$$ets/logo-0c9589cb57d3f36c1633353f3fd27185.png");
    });
  });
});

