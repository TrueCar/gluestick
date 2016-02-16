var chalk = require("chalk");

const _success = chalk.green;
const _info = chalk.yellow;
const _warn = chalk.red;
const _highlight = chalk.bold;
const _filename = chalk.cyan;


function success(text){
  console.log(_success(text));
}

function info(text){
  console.log(_info(text));
}

function warn(text){
  console.log(_warn(text));
}

function error(text){
  warn("ERROR: " + text);
}

module.exports = {
  _highlight,
  _filename,
  _success,
  _info,
  _warn,
  success,
  info,
  warn,
  error
};
