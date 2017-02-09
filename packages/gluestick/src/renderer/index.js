const path = require('path');

// Read config from command line arguments.
const config = JSON.parse(process.argv[2]);

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
  plugins: [
    'transform-flow-strip-types',
  ],
}, babelAdditions));

// Prepare logger.
const loggerFactory = type => {
  if (process.env.NODE_ENV === 'production') {
    return value => {
      const log = `${type.toUpperCase()}: ${value}`;
      if (type === 'error') {
        process.stderr.write(log);
      } else {
        process.stdout.write(log);
      }
    };
  }
  return value => {
    process.send({ type, value });
  };
};
const logger = {
  info: loggerFactory('info'),
  success: loggerFactory('success'),
  error: loggerFactory('error'),
  warn: loggerFactory('warn'),
  debug: loggerFactory('debug'),
};

// Exec renderer server.
require('./main')({ config, logger });
