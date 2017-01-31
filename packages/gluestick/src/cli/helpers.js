const path = require("path");
const fs = require("fs");

module.exports = exports = {
  parseBooleanFlag: value => ["false", "0", "no"].includes(value),
  notifyUpdate: (config, logger) => {
    const indexFilePath = path.join(process.cwd(), "Index.js");
    const data = fs.readFileSync(indexFilePath);
    if (data.indexOf("Helmet.rewind()") === -1) {
      logger.info(`
##########################################################################
Upgrade Notice: Newer versions of Index.js now include react-helmet
for allowing dynamic changes to document header data. You will need to
manually update your Index.js file to receive this change.
For a simple example see:
https://github.com/TrueCar/gluestick/blob/develop/templates/new/Index.js
##########################################################################
      `);
    }
  },
  getVersion: () => require(path.join(__dirname, "../../", "package.json")).version
};
