/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

// WARNING: The contents of this file _including process.env variables_ will be
// exposed in the client code.

type HeadContent = {
  title: string;
  titleTemplate: string;
  meta: {name: string, content: string}[];
}

type Logger = {
  pretty: boolean;
  level: string;
}

type EnvConfig = {
  head: HeadContent;
  logger: Logger;
  httpClient?: Object;
  proxies?: Array<{
    path: string;
    destination: string;
    options?: Object;
    filter?: Function;
  }>
}

type Config = {
  development: EnvConfig;
  production: EnvConfig;
}

const headContent: HeadContent = {
  title: "My Gluestick App",
  titleTemplate: "%s | Gluestick Application",
  meta: [
    {name: "description", content: "Gluestick application"}
  ]
};

const config: Config = {
  development: {
    head: headContent,
    logger: {
      pretty: true,
      level: "info"
    }
  },
  production: {
    head: headContent,
    logger: {
      pretty: false,
      level: "warn"
    }
  }
};

export default config[process.env.NODE_ENV === "production" ? "production" : "development"];
`;
