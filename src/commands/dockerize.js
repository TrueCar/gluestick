import { spawn } from "cross-spawn";
import path from "path";
import process from "process";
import fs from "fs";

module.exports = function (name) {
  const { version: gluestickVersion } = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));
  spawn("docker", ["build", "-t", name, "--build-arg", `GLUESTICK_VERSION=${gluestickVersion}`, "-f", path.join(process.cwd(), "src", "config", ".Dockerfile"), process.cwd()], {stdio: "inherit"});
};

