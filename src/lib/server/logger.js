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

export function parseLogParams(params) {
  const object = JSON.parse(params);
  const result = {};

  Object.entries(CLI_PARAM_MAP).forEach(e => {
    const [key, value] = e;
    if (object[key]) {
      result[value] = object[key];
    }
  });
  return result;
}

export function setupLogParams(config) {
  let pretty = null;
  let cliOptions = {};

  if (process.env.GS_COMMAND_OPTIONS) {
    cliOptions = parseLogParams(process.env.GS_COMMAND_OPTIONS);
  }

  if (!!config.pretty || !!cliOptions.pretty) {
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
  const { logConfig, prettyConfig } = setupLogParams(appLogConfig);
  return middleware ? expressPinoLogger(logConfig, prettyConfig) : pino(logConfig, prettyConfig);
}

export function getLoggerMiddleware() {
  return getLogger(true);
}
