require('babel-polyfill');
require('babel-register')({
  ignore: filename => filename.includes('node_modules') && !filename.includes('gluestick'),
  presets: [
    'react',
    'es2015',
    'stage-0',
  ],
});

const config = process.argv.slice(2).reduce((prev, curr) => {
  const arg = curr.split('=');
  return Object.assign(prev, { [arg[0]]: arg[1] });
}, {});

const logger = {
  info: value => { process.send({ type: 'info', value }); },
  success: value => { process.send({ type: 'success', value }); },
  error: value => { process.send({ type: 'error', value }); },
  warn: value => { process.send({ type: 'warn', value }); },
};

require('./main')({ config, logger });
