/*eslint-disable no-console*/
const logsColorScheme = require("./logsColorScheme");

function success(...args){
  console.log(...args.map(arg => logsColorScheme.success(arg)));
}

function info(...args){
  console.log(...args.map(arg => logsColorScheme.info(arg)));
}

function warn(...args) {
  console.log(...args.map(arg => logsColorScheme.warn(arg)));
}

function error(...args){
  warn("ERROR:", ...args);
}

module.exports = {
  success,
  info,
  warn,
  error
};
