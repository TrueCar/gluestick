/* @flow */

import type {
  BaseLogger,
  CacheManager,
  GetCachedIfProd,
  SetCacheIfProd,
} from '../../types';

const LRU = require('lru-cache');

// Creating cache
const DEFAULT_TTL: number = 60 * 60;
const lruOptions: { maxAge: number, max: number } = {
  maxAge: DEFAULT_TTL * 1000,
  max: 50,
};
const _cache: Object = LRU(lruOptions);

const getCacheKey = ({
  hostname,
  url,
}: {
  hostname: string,
  url: string,
}): string => {
  return `${hostname}${url}`;
};

const customCacheKeyStrategies = {};
module.exports = function createCacheManager(
  logger: BaseLogger,
  isProduction: boolean,
): CacheManager {
  const getCachedIfProd: GetCachedIfProd = (req, cache = _cache) => {
    if (isProduction) {
      const defaultKey: string = getCacheKey(req);
      let key = defaultKey;
      if (customCacheKeyStrategies[defaultKey]) {
        const cacheKeyStrategy = customCacheKeyStrategies[defaultKey];
        key = cacheKeyStrategy(req);
      }
      const value: string = cache.get(key);
      if (value) {
        logger.debug(`Get cached: ${key}`);
        return value;
      }
    }
    return null;
  };
  const setCacheIfProd: SetCacheIfProd = (
    req,
    value,
    maxAge = DEFAULT_TTL,
    cache = _cache,
    cacheKeyStrategy,
    state,
  ) => {
    if (isProduction) {
      const defaultKey: string = getCacheKey(req);
      let key = defaultKey;
      if (cacheKeyStrategy) {
        key = cacheKeyStrategy(req, state);
        customCacheKeyStrategies[defaultKey] = cacheKeyStrategy;
      }

      if (key) {
        cache.set(key, value, maxAge * 1000);
        logger.debug(`Set cache: ${key}`);
      }
    }
  };
  return {
    getCachedIfProd,
    setCacheIfProd,
  };
};
