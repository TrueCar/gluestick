import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
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
    const expectedLastLine = 'export default (config[process.env.NODE_ENV] || config["development"])';
    if (lastAppConfigLine === expectedLastLine) {
      resolve();
      return;
    }

    const exampleContents = fs.readFileSync(path.join(__dirname, "..", "new", "src", "config", "application.js"), "utf8");
    const question = {
      type: "confirm",
      name: "confirm",
      message: `${chalk.red("The format of src/config/application.js is out of date. You should export the correct config object based on the environment.")}
${chalk.yellow("Example:")}\n${chalk.cyan(exampleContents)}
Would you like to try to automatically update it?`
    };
    inquirer.prompt([question], function (answers) {
      if (!answers.confirm) return resolve();
      doUpgrade(appConfig, expectedLastLine, appConfigPath);
      resolve();
    });
  });
}

function doUpgrade (appConfig, expectedLastLine, appConfigPath) {
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

