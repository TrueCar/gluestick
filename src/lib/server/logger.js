import fs from "fs-extra";
import path from "path";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";

export const pinoBaseConfig = {
  name: "GlueStick",
  safe: true,
  level: "warn"
};

export function setupLogParams(config) {
  let level = null;
  let pretty = null;

  const commandOptions = process.env.GS_COMMAND_OPTIONS;

  // prefer logging options set on the command line
  if (commandOptions) {
    const options = JSON.parse(commandOptions);
    if (options.hasOwnProperty("logLevel")) {
      level = options.logLevel;
    }
  }

  // use the application config as a fallback
  if (config) {
    if (level === null) {
      level = config.level;
    }

    if (!!config.pretty) {
      pretty = pino.pretty();
      pretty.pipe(process.stdout);
    }
  }

  return {
    logConfig: {...pinoBaseConfig, level: level || pinoBaseConfig.level},
    prettyConfig: pretty
  };
}

const appConfigPath = path.join(process.cwd(), "src", "config", "application");

export function getLogger(middleware=false) {
  let appLogConfig = null;
  try {
    fs.statSync(`${appConfigPath}.js`);
    appLogConfig = require(appConfigPath).default.logger;
  }
  catch(e) {
    // no application config file yet
  }
  const { logConfig, prettyConfig } = setupLogParams(appLogConfig);
  return middleware ? expressPinoLogger(logConfig, prettyConfig) : pino(logConfig, prettyConfig);
}

export function getLoggerMiddleware() {
  return getLogger(true);
}
