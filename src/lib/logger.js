var logsColorScheme = require("./logsColorScheme");

function success(text){
  console.log(logsColorScheme.success(text));
}

function info(text){
  console.log(logsColorScheme.info(text));
}

function warn(text){
  console.log(logsColorScheme.warn(text));
}

function error(text){
  warn("ERROR: " + text);
}

module.exports = {
  success,
  info,
  warn,
  error
};
