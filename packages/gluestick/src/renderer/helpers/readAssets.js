/* @flow */
const fs = require('fs');

let cache: ?Object = null;

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
