import chalk from "chalk";

export const MISSING_404_TEXT = "MISSING_404_TEXT";

const helpTextHandlers = {
  [MISSING_404_TEXT]: showMissing404Text
};

export default function showHelpText (key) {
  const bar = "#########################################################################";
  console.log("\n" + bar);
  helpTextHandlers[key]();
  console.log(bar + "\n");
}

function showMissing404Text () {
  console.log(chalk.yellow("Rendered a 404 Error but no custom 404 route detected."));
  console.log("You can create a custom 404 handler with the following steps:");
  console.log("1. Create a new container that you would like to use when rendering 404 errors.");
  console.log(`  ${chalk.cyan('gluestick generate container RouteNotFound')}`);
  console.log("2. Import this new container in the routes file along with the \`ROUTE_NAME_404_NOT_FOUND\` constant.");
  console.log(`  ${chalk.cyan('import RouteNotFound from "../containers/RouteNotFound";')}`);
  console.log(`  ${chalk.cyan('import { ROUTE_NAME_404_NOT_FOUND } from "gluestick-shared";')}`);
  console.log("3. Add a new route that uses this constant and container as your very last route.");
  console.log("  " + chalk.cyan(`<Route name={${chalk.yellow('ROUTE_NAME_404_NOT_FOUND')} path="${chalk.yellow('*')}" component={${chalk.yellow('RouteNotFound')}} />`));
}

