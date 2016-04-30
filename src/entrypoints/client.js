/*global __PATH_TO_ENTRY__*/
/*global __webpack_public_path__*/
/*exported  __webpack_public_path__*/
require("match-media/matchMedia.js");
require("match-media/matchMedia.addListener.js");
require("babel-polyfill");
__webpack_public_path__ = window.__GS_PUBLIC_PATH__;
const Entry = require(__PATH_TO_ENTRY__).default;
Entry.start();

