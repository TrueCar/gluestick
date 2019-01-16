/*
 * Apply a patch to req.host to fix a bug that exists in Express v4.
 *
 * Specifically, without this patch, req.host will only return the host _name_
 * and not the full host including the port number.
 *
 * This patch currently exists in Express v5, which is also currently alpha.
 *
 * For more information, see:
 *
 * https://expressjs.com/en/guide/migrating-5.html#req.host
 * https://github.com/expressjs/express/blob/4.16.4/lib/request.js#L448-L452
 * https://github.com/expressjs/express/blob/5.0.0-alpha.7/lib/request.js#L395-L415
 */
function patchRequestHost () {
  return function patchRequestHost (req, res, next) {
    defineGetter(req, 'host', function host (){
      var trust = this.app.get('trust proxy fn');
      var val = this.get('X-Forwarded-Host');

      if (!val || !trust(this.connection.remoteAddress, 0)) {
        val = this.get('Host');
      }

      return val || undefined;
    });

    next();
  };
}

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter
  });
}

module.exports = patchRequestHost;
