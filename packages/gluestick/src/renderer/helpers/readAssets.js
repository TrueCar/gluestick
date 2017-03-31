/* @flow */
const path = require('path');
const fs = require('fs');

let cache: ?Object = null;
const isProduction: boolean = process.env.NODE_ENV === 'production';

module.exports = (assetsPath: string): Promise<Object> => {
  return new Promise((resolve, reject) => {
    if (isProduction && cache) {
      resolve(cache);
    } else {
      fs.readFile(
        path.join(process.cwd(), assetsPath),
        (error, assetsBuffer) => {
          if (error) {
            reject(error);
          } else {
            cache = JSON.parse(assetsBuffer.toString());
            resolve(cache);
          }
        },
      );
    }
  });
};
