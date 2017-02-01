import serveAssets, { DEFAULT_ASSETS_CONFIG } from '../serveAssets';

describe('lib/server/serveAssets', () => {
  let mockStaticMiddleware;
  let app;
  let mockLoadServerConfig;

  beforeEach(() => {
    mockStaticMiddleware = jest.fn();
    mockLoadServerConfig = jest.fn().mockImplementation(() => {});
    app = {
      use: jest.fn(),
    };
  });

  describe('when no asset configuration has been set', () => {
    it('should use the default configuration', () => {
      serveAssets(app, mockLoadServerConfig(), mockStaticMiddleware);
      expect(mockStaticMiddleware)
        .toBeCalledWith(DEFAULT_ASSETS_CONFIG.buildFolder, DEFAULT_ASSETS_CONFIG.options);
      expect(app.use.mock.calls[0][0]).toEqual(DEFAULT_ASSETS_CONFIG.path);
    });
  });

  describe('when asset configuration has been set', () => {
    it('should merge custom options', () => {
      mockLoadServerConfig = jest.fn().mockImplementationOnce(() => ({
        assets: {
          options: {
            test: 'best',
          },
        },
      }));
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(mockStaticMiddleware.mock.calls[0][1]).toEqual({
        ...DEFAULT_ASSETS_CONFIG.options,
        test: 'best',
      });
    });

    it('should pass the custom asset path', () => {
      mockLoadServerConfig = jest.fn().mockImplementationOnce(() => ({
        assets: {
          path: '/files',
        },
      }));
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(app.use.mock.calls[0][0]).toEqual('/files');
    });

    it('should pass the custom build folder', () => {
      mockLoadServerConfig = jest.fn().mockImplementationOnce(() => ({
        assets: {
          buildFolder: 'public-files',
        },
      }));
      serveAssets(app, mockLoadServerConfig, mockStaticMiddleware);
      expect(mockStaticMiddleware.mock.calls[0][0]).toEqual('public-files');
    });
  });
});
