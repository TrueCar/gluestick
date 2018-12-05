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
      get: jest.fn(key => {
        if (key === 'localhost/') {
          return 'output';
        } else if (key === 'localhost-/test-123') {
          return 'cache';
        } else if (key === 'localhost-/test-124') {
          return 'cache2';
        }
        return null;
      }),
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
        1000000,
      ]);
    });

    describe('when a custom cache key strategy is defined', () => {
      beforeAll(() => {
        cache.set.mockClear();
        cacheManager.setCacheIfProd(
          {
            hostname: 'localhost',
            url: '/test',
            query: {
              styleId: '123',
              unused: 'hello',
            },
          },
          'cache',
          1000,
          cache,
          ({ hostname, url, query }) => `${hostname}-${url}-${query.styleId}`,
        );
        cacheManager.setCacheIfProd(
          {
            hostname: 'localhost',
            url: '/test',
            query: {
              styleId: '124',
              unused: 'hello',
            },
          },
          'cache',
          1000,
          cache,
          ({ hostname, url, query }) => `${hostname}-${url}-${query.styleId}`,
        );
      });

      it('should set cache using the custom cache key', () => {
        expect(cache.set.mock.calls[0]).toEqual([
          'localhost-/test-123',
          'cache',
          1000000,
        ]);
      });

      it('should return cached output', () => {
        const cached1 = cacheManager.getCachedIfProd(
          {
            hostname: 'localhost',
            url: '/test',
            query: {
              styleId: '123',
              unused: 'hello',
            },
          },
          cache,
        );
        const cached2 = cacheManager.getCachedIfProd(
          {
            hostname: 'localhost',
            url: '/test',
            query: {
              styleId: '123',
              unused: 'blah',
            },
          },
          cache,
        );
        const cached3 = cacheManager.getCachedIfProd(
          {
            hostname: 'localhost',
            url: '/test',
            query: {
              styleId: '124',
              unused: 'hello',
            },
          },
          cache,
        );
        expect(cached1).toEqual('cache');
        expect(cached2).toEqual('cache');
        expect(cached3).toEqual('cache2');
      });
    });
  });
});
