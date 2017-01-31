/* eslint-disable no-console */
require("./runThroughBabel");
const fs = require("fs");
const { join } = require("path");
const requireHacker = require("require-hacker");
const { isGluestickProject } = require("./utils");

const templatePackage = JSON.parse(fs.readFileSync(join(__dirname, "..", "..", "templates/new/package.json"), "utf8"));

const sharedPackages = isGluestickProject() ? Object.keys(templatePackage.dependencies) : [];

requireHacker.resolver((path, module) => {
  const pathName = path.split("/")[0];
  if (sharedPackages.includes(pathName)) {
    return requireHacker.resolve(join(process.cwd(), "node_modules", path), module);
  }

  return;
});

