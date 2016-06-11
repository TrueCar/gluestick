/*eslint-disable no-console*/
import logsColorScheme from "./logsColorScheme";

const PREFIX = "[GlueStick]";

function success(...args){
  console.log(PREFIX, ...args.map(arg => logsColorScheme.success(arg)));
}

function info(...args){
  console.log(PREFIX, ...args.map(arg => logsColorScheme.info(arg)));
}

function warn(...args) {
  console.log(PREFIX, ...args.map(arg => logsColorScheme.warn(arg)));
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
