/* @flow */

import type { Logger, Request } from '../../types';

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

module.exports = (logger: Logger, isProduction: boolean) => ({
  getCachedIfProd: (req: Request, cache: Object = _cache): string | null => {
    if (isProduction) {
      const key: string = getCacheKey(req);
      const value: string = cache.get(key);
      if (value) {
        logger.debug(`Get cached: ${key}`);
        return value;
      }
    }
    return null;
  },
  setCacheIfProd: (
    req: Request,
    value: string,
    maxAge: number = DEFAULT_TTL,
    cache: Object = _cache,
  ) => {
    if (isProduction) {
      const key: string = getCacheKey(req);
      logger.debug(`Set cache: ${key}`);
      cache.set(key, value, maxAge);
    }
  },
});
