import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import logger from "../lib/logger";
import readFileSyncStrip from "../lib/readFileSyncStrip";

const CWD = process.cwd();

/**
 * The configuration file located at src/config/application.js has been
 * modified so that it returns only the configuration relevant to the current
 * node environment `process.env.NODE_ENV`. Since this file can not be
 * completely swapped, we will attempt to update the file for the developer so
 * that it meets the new requirements.
 */
export default function updateConfig () {
  return new Promise((resolve) => {
    const appConfigPath = path.join(CWD, "src", "config", "application.js");
    const appConfig = readFileSyncStrip(appConfigPath);
    const lastAppConfigLine = appConfig.split("\n").pop();
    const expectedLastLine = 'export default (config[process.env.NODE_ENV] || config["development"]);';

    const hasExportUpgrade = lastAppConfigLine === expectedLastLine;
    const hasHeadUpgrade = appConfig.indexOf('const headContent = {') != -1;
    if (hasExportUpgrade && hasHeadUpgrade) {
      resolve();
      return;
    }

    const exampleContents = fs.readFileSync(path.join(__dirname, "..", "..", "new", "src", "config", "application.js"), "utf8");
    let message = "The format of src/config/application.js is out of date.";
    if (hasExportUpgrade) {
      message += " You should manually update it to get new config values for document head changes.";
    } else {
      message += " You should export the correct config object based on the environment.";
    }
    logger.warn(message);
    logger.info(`Example:\n${chalk.cyan(exampleContents)}`);

    if (hasExportUpgrade) {
      return resolve();
    }

    const question = {
      type: "confirm",
      name: "confirm",
      message: "Would you like to try to automatically update it?"
    };
    inquirer.prompt([question]).then(function (answers) {
      if (!answers.confirm) {
        return resolve();
      }
      doExportUpgrade(appConfig, expectedLastLine, appConfigPath);
      resolve();
    });
  });
}

function doExportUpgrade (appConfig, expectedLastLine, appConfigPath) {
  const newAppConfig = appConfig.split("\n").map((line) => {
    if (line === "export default {") {
      return "const config = {";
    }
    return line;
  });

  newAppConfig.push("");
  newAppConfig.push(expectedLastLine);
  fs.writeFileSync(appConfigPath, newAppConfig.join("\n") + "\n\n");
}

