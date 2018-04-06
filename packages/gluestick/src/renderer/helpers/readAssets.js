/* @flow */
const fs = require('fs');

let cache: ?Object = null;

// need to look through the history of this file to find why this is being cached
// it might make sense to readSync here since we can cache at the module level and
// the block would only happen once on startup
// this would make the whole import static again
module.exports = function readAssets(assetsPath: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production' && cache) {
      resolve(cache);
    } else {
      fs.readFile(assetsPath, (error, assetsBuffer) => {
        if (error) {
          reject(
            `Failed to read ${assetsPath} ${error.code
              ? `(${error.code})`
              : ''}. Did you forget to compile the client bundle? ` +
              `Run 'gluestick build --client' and try again.`,
          );
        } else {
          cache = JSON.parse(assetsBuffer.toString());
          resolve(cache);
        }
      });
    }
  });
};
