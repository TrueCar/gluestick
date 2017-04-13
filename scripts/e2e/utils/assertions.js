const path = require('path');
const fs = require('fs');

const existsFn = (shouldExist, errorMsg, cwd, files) => {
  files.forEach(file => {
    const pathToFile = path.join(cwd, file);
    let checkResults = fs.existsSync(pathToFile);
    if (!shouldExist) {
      checkResults = !checkResults;
    }
    console.log(`/ * Asserting: ${pathToFile} should${shouldExist ? '' : ' not'} exist * /`);
    if (!checkResults) {
      throw new Error(errorMsg(pathToFile));
    }
  });
};

const exists = (cwd, ...files) => {
  existsFn(true, pathToFile => `File ${pathToFile} does not exists`, cwd, files);
};

const notExists = (cwd, ...files) => {
  existsFn(false, pathToFile => `File ${pathToFile} should not exists`, cwd, files);
};

module.exports = {
  exists,
  notExists,
};
