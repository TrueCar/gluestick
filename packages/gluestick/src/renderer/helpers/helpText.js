/* @flow */
import type { BaseLogger } from '../../types';

const MISSING_404_TEXT: string = 'MISSING_404_TEXT';

const showMissing404Text = (logger: BaseLogger): void => {
  logger.info(`
#########################################################################################
Rendered a 404 Error but no custom 404 route detected.
You can create a custom 404 handler with the following steps:
  1. Create a new container that you would like to use when rendering 404 errors.
     > gluestick generate container RouteNotFound
  2. Import this new container in the routes file along
     with the 'ROUTE_NAME_404_NOT_FOUND' constant.
     import RouteNotFound from "../containers/RouteNotFound";
     import { ROUTE_NAME_404_NOT_FOUND } from "gluestick-shared";
  3. Add a new route that uses this constant and container as your very last route.
      <Route name={"ROUTE_NAME_404_NOT_FOUND"} path="*" component={RouteNotFound} />
#########################################################################################
`);
};

const helpTextHandlers: { [key: string]: (logger: BaseLogger) => void } = {
  MISSING_404_TEXT: showMissing404Text,
};

const showHelpText = (key: string, logger: BaseLogger): void => {
  helpTextHandlers[key](logger);
};

module.exports = {
  showHelpText,
  MISSING_404_TEXT,
};
