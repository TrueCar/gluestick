import { spawn } from "cross-spawn";
import path from "path";
import process from "process";
import logger from "../lib/cliLogger.js";
import { which } from "shelljs";

module.exports = function (name) {
  // Check if docker is installed first
  if( which("docker") !== null ) {
    spawn("docker", ["build", "-t", name, "-f", path.join(process.cwd(), "src", "config", ".Dockerfile"), process.cwd()], {stdio: "inherit"});
  } else {
    logger.warn("You must install docker before continuing");
  }
};
