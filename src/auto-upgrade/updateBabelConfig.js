import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import logger from "../lib/logger";
import { warn } from "../lib/logsColorScheme";


function doUpdate(from, to) {
  logger.info("Updating .babelrc file...");
  fs.copySync(from, to);
}

export default function updateBabelConfig() {
  return new Promise(resolve => {

    const projectConfigPath = path.join(process.cwd(), ".babelrc");
    const projectConfig = fs.readJsonSync(projectConfigPath);

    const previousConfigPath = path.join(__dirname, "previous", ".babelrc");
    const previousConfig = fs.readJsonSync(previousConfigPath);

    const latestConfigPath = path.join(__dirname, "../..", "new", ".babelrc");

    if (JSON.stringify(projectConfig) != JSON.stringify(previousConfig)) {

      const question = {
        type: "confirm",
        name: "confirm",
        message: `${warn("The format of .babelrc is out of date. Would you like to automatically update it?")}`
      };

      inquirer.prompt([question], function (answers) {
        if (!answers.confirm) {
          const latestConfig = fs.readFileSync(latestConfigPath);
          logger.info(`It is recommended that you update your .babelrc file. Here is an example file:\n${latestConfig}`);
          return resolve();
        }

        doUpdate(latestConfigPath, projectConfigPath);
        return resolve();
      });

    } else {
      doUpdate(latestConfigPath, projectConfigPath);
      resolve();
    }
  });
}
