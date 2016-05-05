import logger from "./logger";
import { filename, info } from "./logsColorScheme";

export const MISSING_404_TEXT = "MISSING_404_TEXT";

const helpTextHandlers = {
  [MISSING_404_TEXT]: showMissing404Text
};

export default function showHelpText (key) {
  const bar = "#########################################################################";
  logger.info("\n" + bar);
  helpTextHandlers[key]();
  logger.info(bar + "\n");
}

function showMissing404Text () {
  logger.info("Rendered a 404 Error but no custom 404 route detected.");
  logger.info("You can create a custom 404 handler with the following steps:");
  logger.info("1. Create a new container that you would like to use when rendering 404 errors.");
  logger.info(`  ${filename("gluestick generate container RouteNotFound")}`);
  logger.info("2. Import this new container in the routes file along with the \`ROUTE_NAME_404_NOT_FOUND\` constant.");
  logger.info(`  ${filename("import RouteNotFound from \"../containers/RouteNotFound\";")}`);
  logger.info(`  ${filename("import { ROUTE_NAME_404_NOT_FOUND } from \"gluestick-shared\";")}`);
  logger.info("3. Add a new route that uses this constant and container as your very last route.");
  logger.info("  " + filename(`<Route name={${info("ROUTE_NAME_404_NOT_FOUND")}} path="${info("*")}" component={${info("RouteNotFound")}} />`));
}

