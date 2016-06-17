import fs from "fs";
import path from "path";
import logger from "./cliLogger";
import { highlight } from "./cliColorScheme";

export function quitUnlessGluestickProject(command) {
  if (!isGluestickProject()) {
    logger.error(`${highlight(command)} commands must be run from the root of a gluestick project.`);
    process.exit();
  }
}

export function isGluestickProject(dir=process.cwd()) {
  try {
    fs.statSync(path.join(dir, ".gluestick"));
  } catch (err) {
    return false;
  }
  return true;
}

export function compareVersions(versionA, versionB) {
  const numbersA = versionA.split(".");
  const numbersB = versionB.split(".");
  for (let i = 0; i < 3; i++) {
    const numberA = Number(numbersA[i]);
    const numberB = Number(numbersB[i]);
    if (numberA > numberB) { return 1; }
    if (numberB > numberA) { return -1; }
    if (!Number.isNaN(numberA) && Number.isNaN(numberB)) { return 1; }
    if (Number.isNaN(numberA) && !Number.isNaN(numberB)) { return -1; }
  }
  return 0;
}
