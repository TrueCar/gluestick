import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import sha1 from "sha1";
import readFileSyncStrip from "../lib/readFileSyncStrip";
import logger from "../lib/logger";
import { warn } from "../lib/logsColorScheme";


function doUpdate(from, to) {
  logger.info("Updating .babelrc file...");
  fs.copySync(from, to);
}

export default function updateBabelConfig() {
  return new Promise(resolve => {

    const projectConfigPath = path.join(process.cwd(), ".babelrc");
    const latestConfigPath = path.join(__dirname, "../..", "new", ".babelrc");
    const projectSha = sha1(readFileSyncStrip(projectConfigPath));
    const previousSha = sha1(readFileSyncStrip(path.join(__dirname, "previous", ".babelrc")));
    const latestSha = sha1(readFileSyncStrip(latestConfigPath));

    if (projectSha === latestSha) {
      return resolve();
    } 
    else if (projectSha !== previousSha) {
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
        resolve();
      });
    }
  });
}
