import fs from "fs-extra";
import path from "path";
import pino from "pino";
import expressPinoLogger from "express-pino-logger";

export const pinoBaseConfig = {
  name: "GlueStick",
  safe: true,
  level: "warn"
};

const CLI_PARAM_MAP = {
  "logLevel": "level",
  "logPretty": "pretty"
};

export function parseLogOptions(options) {
  const object = JSON.parse(options);
  const result = {};

  Object.entries(CLI_PARAM_MAP).forEach(e => {
    const [key, value] = e;
    if (object.hasOwnProperty(key) && object[key] !== null) {
      result[value] = object[key];
    }
  });

  return result;
}

export function getLogConfig(config={}) {
  let pretty = null;
  let cliOptions = {};

  if (process.env.GS_COMMAND_OPTIONS) {
    cliOptions = parseLogOptions(process.env.GS_COMMAND_OPTIONS);
  }

  if (cliOptions.hasOwnProperty("pretty") && cliOptions.pretty !== true) {
    pretty = null;
  }
  else if (!!config.pretty || cliOptions.pretty === true) {
    pretty = pino.pretty();
    pretty.pipe(process.stdout);
  }

  return {
    logConfig: {...pinoBaseConfig, ...config, ...cliOptions},
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
    appLogConfig = {};
  }
  const { logConfig, prettyConfig } = getLogConfig(appLogConfig);
  return middleware ? expressPinoLogger(logConfig, prettyConfig) : pino(logConfig, prettyConfig);
}

export function getLoggerMiddleware() {
  return getLogger(true);
}
