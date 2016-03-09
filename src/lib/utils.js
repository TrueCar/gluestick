import fs from "fs";
import path from "path";
import logger from "./logger";

export function isGluestickProject(dir=process.cwd()) { 
  try {
    fs.statSync(path.join(dir, ".gluestick"));
  } catch (err) {
    return false;
  }
  return true;
}
