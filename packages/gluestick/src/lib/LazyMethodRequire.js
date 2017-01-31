/**
 * ES5 Example:
 * var lazyMethodRequire = require("./lib/LazyMethodRequire")(__dirname);
 *
 * ES6 Example:
 * import LazyMethodRequire from "./lib/LazyMethodRequire";
 * const lazyMethodRequire = LazyMethodRequire(__dirname);
 */
import path from "path";

/**
 * This method is used when you want to import a method that shouldn't be
 * resolved until it is called. This prevents issues in commands like
 * `start-client` that rely on being run from within an existing project.
 * These commands would look in `process.cwd()` for files that don't exist when
 * you are running a command line `gluestick new …`. This way, imports only
 * happen when they are needed.
 *
 * @param {String} path
 *
 * @return {Function}
 */
function lazyMethodRequire (dirname, requirePath) {
  return (...args) => {
    return require(path.join(dirname, requirePath))(...args);
  };
}

/**
 * `require` calls are relative to the path of the file that call it. Since
 * this method lives in `src/lib` and it could potentially be called from other
 * folders, we need a way to pass in the __dirname argument so that these calls
 * can be relative to the location they were called from.
 */
export default function LazyMethodRequire (dirname="") {
  return (requirePath) => {
    return lazyMethodRequire(dirname, requirePath);
  };
}

