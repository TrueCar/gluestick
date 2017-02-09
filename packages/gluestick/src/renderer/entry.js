// Read config from command line arguments.
const config = JSON.parse(process.argv[2]);

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
