const configVars = require("../config/vars");

require("babel-polyfill");
require("babel-core/register")({
  presets: [
    "react",
    "es2015",
    "stage-0"
  ],
  plugins: [
    "transform-decorators-legacy"
  ],
  ignore: function(filename) {
    if(filename.match(configVars.GLUESTICK_ADDON_DIR_REGEX) || filename.includes(configVars.GLUESTICK_DIR)) {
      return false;
    }

    return filename.includes(configVars.NODE_MODULES_DIR);
  }
});

