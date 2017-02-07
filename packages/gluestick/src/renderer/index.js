const path = require('path');

// Read config from command line arguments.
const config = process.argv.slice(2).reduce((prev, curr) => {
  const arg = curr.split('=');
  return Object.assign(prev, { [arg[0]]: arg[1] });
}, {});

// Read babel additional settings.
const babelAdditions = config.babel ? require(path.join(process.cwd(), config.babel)) : {};
require('babel-polyfill');
require('babel-register')(Object.assign({
  ignore: filename => filename.includes('node_modules') && !filename.includes('gluestick'),
  presets: [
    'react',
    'es2015',
    'stage-0',
  ],
}, babelAdditions));

// Prepare logger.
const logger = {
  info: value => { process.send({ type: 'info', value }); },
  success: value => { process.send({ type: 'success', value }); },
  error: value => { process.send({ type: 'error', value }); },
  warn: value => { process.send({ type: 'warn', value }); },
  debug: value => { process.send({ type: 'debug', value }); },
};

// Exec renderer server.
require('./main')({ config, logger });
