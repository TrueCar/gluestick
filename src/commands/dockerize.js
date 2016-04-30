import { spawn } from "cross-spawn";
import path from "path";
import process from "process";

module.exports = function (name) {
  // @TODO: check if docker is installed first (https://github.com/TrueCar/gluestick/issues/128)
  spawn("docker", ["build", "-t", name, "-f", path.join(process.cwd(), "src", "config", ".Dockerfile"), process.cwd()], {stdio: "inherit"});
};

