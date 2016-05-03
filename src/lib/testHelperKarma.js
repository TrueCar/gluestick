/* global TEST_PATH */
/* global SRC_PATH */
require("./testHelperShared");

const context = require.context(TEST_PATH, true, /\.test\.js$/);
context.keys().forEach(context);

const srcContext = require.context(SRC_PATH, true, /\.js$/);
srcContext.keys().forEach(srcContext);
