import path from "path";
import { getLogger as getSharedLogger } from "gluestick-shared";

const appConfigPath = path.join(process.cwd(), "src", "config", "application");
export function getLogger(/*middleware=false*/) {
  const appConfig = require(appConfigPath).default;
  return getSharedLogger(appConfig);
}
