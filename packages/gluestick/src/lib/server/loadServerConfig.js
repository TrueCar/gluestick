import fs from "fs";
import path from "path";

export default function loadServerConfig () {
  let serverConfig = {};

  const serverConfigPath = path.join(process.cwd(), "src", "config", "application.server.js");
  try {
    fs.statSync(serverConfigPath);
    serverConfig = require(serverConfigPath).default;
  }
  catch (e) {
    // NOOP
  }

  return serverConfig;
}

