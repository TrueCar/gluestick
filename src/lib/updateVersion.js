import fs from "fs";
import path from "path";
import logger from "./cliLogger";
import readFileSyncStrip from "./readFileSyncStrip";
import { compareVersions } from "./utils";

module.exports = function updateLastVersionUsed(gluestickVersion, withWarnings=true) {

  // Check version in .gluestick file
  const gluestickDotFile = path.join(process.cwd(), ".gluestick");
  let fileContents = readFileSyncStrip(gluestickDotFile);
  // We won't know how old this version is, it might have still have the 'DO NOT MODIFY' header
  fileContents = fileContents.replace("DO NOT MODIFY", "");
  if (!fileContents.length) { fileContents = "{}"; }

  const project = JSON.parse(fileContents);
  const needsUpdate = compareVersions(gluestickVersion, project.version || "") === -1;

  if (withWarnings && needsUpdate) {
    logger.warn("This project is configured to work with versions >= " + project.version + " Please upgrade your global `gluestick` module with `sudo npm install gluestick -g`");
    process.exit(1);
    return;
  }

  // Update version in dot file
  const newContents = JSON.stringify({version: gluestickVersion});
  fs.writeFileSync(gluestickDotFile, newContents);
};
