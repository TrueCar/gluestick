exports.NODE_MODULES_DIR = "node_modules";
exports.GLUESTICK_ADDON_DIR_REGEX = /node_modules\/gluestick-addon-.*\/src/;

// We don't use path.join because the filename slashes use the Unix style
// forward slashes on unix and on windows but path.join will give us the
// filenames based on the system. This way we force forward slashes and it
// works on Windows and Unix
exports.GLUESTICK_DIR = "node_modules/gluestick/src";

