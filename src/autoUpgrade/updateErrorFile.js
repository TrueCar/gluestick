import fs from "fs";
import inquirer from "inquirer";
import path from "path";

import { getLogger } from "../lib/server/logger";
const logger = getLogger();

export default function updateConfig () {
  const CWD = process.cwd();
  return new Promise((resolve) => {
    // Check if the 505.hbs error page still exists. If so, rename it to 500.hbs
    const old500FilePath = path.join(CWD, "505.hbs");
    const new500FilePath = path.join(CWD, "500.hbs");
    fs.stat(old500FilePath, (statError, stats) => {
      if (stats && stats.isFile()) {
        logger.warn("The 505.hbs file should be renamed to 500.hbs in order for GlueStick to locate it.");
        const question = {
          type: "confirm",
          name: "confirm",
          message: "Would you like to automatically rename it?"
        };
        inquirer.prompt([question]).then((answers) => {
          if (!answers.confirm) {
            return resolve();
          }
          logger.info(`Renaming ${old500FilePath} to ${new500FilePath}`);
          fs.renameSync(old500FilePath, new500FilePath);
          resolve();
        });
      }
      else {
        return resolve();
      }
    });
  });
}
