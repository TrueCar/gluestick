import { spawn } from "child_process";
import path from "path";
import process from "process";

export default function (name) {
  spawn("docker", ["build", "-t", name, "-f", path.join(process.cwd(), "src", "config", ".Dockerfile"), process.cwd()], {stdio: "inherit"});
}

