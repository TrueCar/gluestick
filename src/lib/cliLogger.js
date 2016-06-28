import cliColorScheme from "./cliColorScheme";

const PREFIX = "[GlueStick]";

function success(...args){
  _log("success", ...args);
}

function info(...args){
  _log("info", ...args);
}

function warn(...args) {
  _log("warn", ...args);
}

function error(...args){
  warn("ERROR:", ...args);
}

function debug(...args) {
  _log("debug", ...args);
}

function _log(scheme, ...args) {
  // eslint-disable-next-line no-console
  console.log(PREFIX, ...args.map(arg => cliColorScheme[scheme](arg)));
}

module.exports = {
  success,
  info,
  warn,
  debug,
  error
};
