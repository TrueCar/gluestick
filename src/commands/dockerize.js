import { spawn } from "cross-spawn";
import path from "path";
import process from "process";
import commandExists from "command-exists";
import logger from "../lib/logger.js";

module.exports = function (name) {
  // Check if docker is installed first
  commandExists("docker", function(err, commandExists) {
    if(commandExists) {
      spawn("docker", ["build", "-t", name, "-f", path.join(process.cwd(), "src", "config", ".Dockerfile"), process.cwd()], {stdio: "inherit"});
    } else {
      logger.warn("You must install docker before continuing");
    }
  });
};
