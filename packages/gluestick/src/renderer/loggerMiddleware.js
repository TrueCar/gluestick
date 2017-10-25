// @flow
import type { Request, Response, BaseLogger } from '../types';

const onFinished = require('on-finished');
const createPluginUtils = require('../plugins/utils');
const prepareServerPlugins = require('../plugins/prepareServerPlugins');
// $FlowIgnore
const entriesPlugins = require('project-entries').plugins;

// Log requests, responses, and errors.
const loggerMiddleware = (logger: BaseLogger) => (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const serverPlugins = prepareServerPlugins(logger, entriesPlugins);

  const pluginUtils = createPluginUtils(logger);
  const customLogger = pluginUtils.getCustomLogger(serverPlugins);

  if (customLogger) {
    customLogger.info({ req });
    onFinished(res, (err, response) => {
      if (err) {
        customLogger.error(err);
      } else {
        customLogger.info({ res: response });
      }
    });
  }
  next();
};

module.exports = loggerMiddleware;
