// const SSRCaching = require('electrode-react-ssr-caching');
const LRU = require('lru-cache');

// Creatin cache
const DEFAULT_TTL = 5 * 10000;
const lruOptions = {
  maxAge: DEFAULT_TTL,
  max: 50,
};
const _cache = LRU(lruOptions);

function getCacheKey({ hostname, url }) {
  return `${hostname}${url}`;
}

module.exports = (logger, isProduction) => ({
  getCachedIfProd: (req, cache = _cache) => {
    if (isProduction) {
      const key = getCacheKey(req);
      const value = cache.get(key);
      if (value) {
        logger.debug(`Get cached: ${key}`);
        return value;
      }
    }
    return null;
  },
  setCacheIfProd: (req, value, maxAge = DEFAULT_TTL, cache = _cache) => {
    if (isProduction) {
      const key = getCacheKey(req);
      logger.debug(`Set cache: ${key}`);
      cache.set(key, value, maxAge);
    }
  },
});
