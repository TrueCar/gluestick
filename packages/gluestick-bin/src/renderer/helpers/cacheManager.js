/* @flow */

import type { Logger, CacheManager, GetCachedIfProd, SetCacheIfProd } from '../../types';

const LRU = require('lru-cache');

// Creatin cache
const DEFAULT_TTL: number = 60 * 60 * 1000;
const lruOptions: { maxAge: number, max: number } = {
  maxAge: DEFAULT_TTL,
  max: 50,
};
const _cache: Object = LRU(lruOptions);

const getCacheKey = ({ hostname, url }: { hostname: string, url: string}): string => {
  return `${hostname}${url}`;
};

module.exports = (logger: Logger, isProduction: boolean): CacheManager => {
  const getCachedIfProd: GetCachedIfProd = (req, cache = _cache) => {
    if (isProduction) {
      const key: string = getCacheKey(req);
      const value: string = cache.get(key);
      if (value) {
        logger.debug(`Get cached: ${key}`);
        return value;
      }
    }
    return null;
  };
  const setCacheIfProd: SetCacheIfProd = (
    req, value, maxAge = DEFAULT_TTL, cache = _cache,
  ) => {
    if (isProduction) {
      const key: string = getCacheKey(req);
      logger.debug(`Set cache: ${key}`);
      cache.set(key, value, maxAge);
    }
  };
  return {
    getCachedIfProd,
    setCacheIfProd,
  };
};
