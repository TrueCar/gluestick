const getCacheManager = require('../cacheManager');

describe('renderer/helpers/cacheManager', () => {
  describe('in development', () => {
    const cacheManager = getCacheManager(
      {
        debug: jest.fn(),
      },
      false,
    );
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
    };
    it('should return null while getting cached output', () => {
      expect(
        cacheManager.getCachedIfProd(
          {
            hostname: '',
            url: '',
          },
          cache,
        ),
      ).toBeNull();
    });

    it('should not set any cache', () => {
      cacheManager.setCacheIfProd(
        {
          hostname: '',
          url: '',
        },
        'cache',
        1000,
        cache,
      );
      expect(cache.set.mock.calls.length).toBe(0);
    });
  });

  describe('in production', () => {
    const cacheManager = getCacheManager(
      {
        debug: jest.fn(),
      },
      true,
    );
    const cache = {
      get: jest.fn(key => (key === 'localhost/' ? 'output' : null)),
      set: jest.fn(),
    };
    it('should return cached output', () => {
      expect(
        cacheManager.getCachedIfProd(
          {
            hostname: 'localhost',
            url: '/',
          },
          cache,
        ),
      ).toEqual('output');
    });

    it('should set cache', () => {
      cacheManager.setCacheIfProd(
        {
          hostname: 'localhost',
          url: '/test',
        },
        'cache',
        1000,
        cache,
      );
      expect(cache.set.mock.calls[0]).toEqual([
        'localhost/test',
        'cache',
        1000,
      ]);
    });
  });
});
