import chalk from "chalk";

const success = chalk.green;
const info = chalk.yellow;
const warn = chalk.red;
const filename = chalk.cyan;
const highlight = chalk.bold;
const debug = chalk.blue;

module.exports = {
  success,
  info,
  warn,
  debug,
  filename,
  highlight
};
