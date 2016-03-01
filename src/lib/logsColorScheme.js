var chalk = require("chalk");

const success   = chalk.green;
const info      = chalk.yellow;
const warn      = chalk.red;
const filename  = chalk.cyan;
const highlight = chalk.bold;

module.exports = {
  success,
  info,
  warn,
  filename,
  highlight
};
