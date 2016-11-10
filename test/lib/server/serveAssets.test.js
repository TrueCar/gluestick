import { expect } from "chai";
import { spy, stub } from "sinon";

import serveAssets, { DEFAULT_ASSETS_CONFIG } from "../../../src/lib/server/serveAssets";

describe("lib/server/serveAssets", () => {
  let mockStaticMiddleware, app, mockLoadServerConfig;

  beforeEach(() => {
    mockStaticMiddleware = spy();
    mockLoadServerConfig = stub().returns({});
    app = {
      use: stub()
    };
  });

  context("when no asset configuration has been set", () => {
    it("should use the default configuration", () => {
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(mockStaticMiddleware.calledWith(DEFAULT_ASSETS_CONFIG.buildFolder, DEFAULT_ASSETS_CONFIG.options)).to.equal(true);
      expect(app.use.calledWith(DEFAULT_ASSETS_CONFIG.path));
    });
  });

  context("when asset configuration has been set", () => {
    it("should merge custom options", () => {
      mockLoadServerConfig.returns({
        assets: {
          options: {
            test: "best"
          }
        }
      });
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(mockStaticMiddleware.lastCall.args[1]).to.deep.equal({
        ...DEFAULT_ASSETS_CONFIG.options,
        test: "best",
      });
    });

    it("should pass the custom asset path", () => {
      mockLoadServerConfig.returns({
        assets: {
          path: "/files"
        }
      });
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(app.use.lastCall.args[0]).to.equal("/files");
    });

    it("should pass the custom build folder", () => {
      mockLoadServerConfig.returns({
        assets: {
          buildFolder: "public-files"
        }
      });
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(mockStaticMiddleware.lastCall.args[0]).to.equal("public-files");
    });
  });
});

