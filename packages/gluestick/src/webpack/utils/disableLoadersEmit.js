/* @flow */

/**
 * Check if given rule uses file-loader or url-loader.
 * 
 * **`rule.use` mus be an array!**
 * 
 * @param {Object} rule Rule object (https://webpack.js.org/configuration/module/#module-rules)
 * @returns {boolean}
 */
function isFileOrUlrLoader(rule: Object) {
  return (
    rule.use.findIndex(
      loaderConfig =>
        (typeof loaderConfig === 'string' &&
          ['file-loader', 'url-loader'].findIndex(name =>
            loaderConfig.includes(name),
          ) > -1) ||
        ['file-loader', 'url-loader'].indexOf(name =>
          loaderConfig.loader.includes(name),
        ) > -1,
    ) > -1
  );
}

/**
 * Set emitFile option to false on every `file-loader` and `url-loader` so they
 * don't emit files. Should be used only in server bundle.
 * 
 * @param {Object} config Webpack config
 */
module.exports = function disableLoadersEmit(config: Object) {
  config.module.rules.filter(isFileOrUlrLoader).forEach(rule => {
    rule.use.forEach((loaderConfig, i) => {
      if (typeof loaderConfig === 'string') {
        // eslint-disable-next-line no-param-reassign
        rule.use[i] = `${loaderConfig}${loaderConfig.includes('?')
          ? '&'
          : '?'}emitFile=false`;
      } else {
        // eslint-disable-next-line no-param-reassign
        loaderConfig.options = {
          ...(loaderConfig.options || {}),
          emitFile: false,
        };
      }
    });
  });
};
