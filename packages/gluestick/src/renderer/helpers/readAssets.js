/* @flow */
const fs = require('fs');

let cache: ?Object = null;

module.exports = (assetsPath: string): Promise<Object> => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production' && cache) {
      resolve(cache);
    } else {
      fs.readFile(assetsPath, (error, assetsBuffer) => {
        if (error) {
          reject(
            `Failed to read ${assetsPath} ${error.code
              ? `(${error.code})`
              : ''}. Did you forgot to compile client bundle? ` +
              `Run 'gluestick build --client', then try again.`,
          );
        } else {
          cache = JSON.parse(assetsBuffer.toString());
          resolve(cache);
        }
      });
    }
  });
};
