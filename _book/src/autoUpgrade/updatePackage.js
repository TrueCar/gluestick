import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import semver from "semver";
import { getLogger } from "../lib/server/logger";
import { install as installDeps, cleanSync as cleanDeps } from "../lib/npmDependencies";
const logger = getLogger();
import sO from "sorted-object";

const PROJECT_PACKAGE_LOCATION = path.join(process.cwd(), "package.json");

// When we load the project package file, we will cache the result so that we
// don't have to do file I/O more than once
let _projectPackageData;

// Used for testing purposes so we can override methods used in fixVersionMismatch
export const FIX_VERSION_MISMATCH_OVERRIDES = {
  loadProjectPackage,
  loadCLIPackage,
  loadNewProjectPackage,
  promptModulesUpdate,
  rejectOnFailure: false
};

/**
 * Open the package.json file in both the project as well as the one used by
 * this command line interface, then compare the versions for shared modules.
 * If the CLI uses a different version than the project we are working in then
 * it will prompt the user to automatically update their project so that it
 * matches the module versions used by the CLI.
 *
 * Now when we update versions in the CLI that the package uses, the projects
 * will automatically get updated too.
 *
 * Also, We include all of the required dependencies when you generate a new
 * project.  Sometimes these dependencies change over time and we need a nice
 * way of updating apps that were generated with previous versions of the CLI.
 * To solve this problem, we look at both the dependencies and development
 * dependencies that would be included in a brand new application. If the
 * project is missing a required dependency, then we prompt the user to update
 * that as well.
 *
 * A Promise is returned so that we can use async/await when calling this
 * method.
 *
 * @return {Promise}
 */
export default function fixVersionMismatch ({loadProjectPackage, loadCLIPackage, loadNewProjectPackage, promptModulesUpdate, rejectOnFailure} = FIX_VERSION_MISMATCH_OVERRIDES) {
  return new Promise((resolve, reject) => {
    const projectPackageData = loadProjectPackage();
    const { dependencies: projectDependencies, devDependencies: projectDevDependencies } = projectPackageData;
    const { dependencies: cliDependencies } = loadCLIPackage();
    const { dependencies: newProjectDependencies, devDependencies: newProjectDevDependencies } = loadNewProjectPackage();
    const mismatchedModules = {};

    // Compare the new project dependencies, mark any module that is missing in
    // the generated project's dependencies
    for(const key in newProjectDependencies) {
      if (!isValidVersion(projectDependencies[key], newProjectDependencies[key])) {
        mismatchedModules[key] = { required: newProjectDependencies[key], project: projectDependencies[key] || "missing", type: "dependencies" };
      }
    }

    // Compare the new project development dependencies, mark any module that
    // is missing in the generated project's development dependencies
    for(const key in newProjectDevDependencies) {
      if (!isValidVersion(projectDevDependencies[key], newProjectDevDependencies[key])) {
        mismatchedModules[key] = { required: newProjectDevDependencies[key], project: projectDevDependencies[key] || "missing", type: "devDependencies" };
      }
    }

    // Compare the CLI dependencies, only mark a module as mismatched if it is
    // included in both and the version do not match
    for(const key in cliDependencies) {
      if (projectDependencies[key] && cliDependencies[key] !== projectDependencies[key]) {
        mismatchedModules[key] = { required: cliDependencies[key], project: projectDependencies[key], type: "dependencies" };
      }
    }

    // prompt for updates if we have any, otherwise we are done
    if (Object.keys(mismatchedModules).length > 0) {
      promptModulesUpdate(mismatchedModules, resolve);

      // Adding for testing purposes
      if (rejectOnFailure) {
        reject();
      }
    }
    else {
      resolve();
    }
  });
}

/**
 * This will open up the project's package file and cache the result. If a
 * cached result exists, then it will return that instead of opening the file
 * again.
 *
 * @return {Object}
 */
function loadProjectPackage () {
  // Cache the result so we don't have to load the file more than once
  if (!_projectPackageData) {
    _projectPackageData = loadPackage(PROJECT_PACKAGE_LOCATION);
  }

  return _projectPackageData;
}

/**
 * This will open up the CLI's package file. This one is not cached since it is
 * called only once.
 *
 * @return {Object}
 */
function loadCLIPackage () {
  return loadPackage(path.join(__dirname, "../../package.json"));
}

/**
 * This will open up the package file that will be included in new projects.
 * This one is not cached since it is called only once.
 *
 * @return {Object}
 */
function loadNewProjectPackage () {
  return loadPackage(path.join(__dirname, "../../templates/new/package.json"));
}

/**
 * Perform the action of reading a package file from the given location and
 * parse the string into a JavaScript object.
 *
 * @param {String} location the path to the package.json file
 *
 * @return {Object}
 */
function loadPackage (location) {
  const packageString = fs.readFileSync(location, "utf8");
  return JSON.parse(packageString);
}

/**
 * Given an object of mismatched modules, prompt the user if they would like to
 * update the modules or not. If the user says no, or they complete the update
 * then the `done` callback is called.
 *
 * @param {Object} mismatchedModules see `fixVersionMismatch` function at the
 * top to see what the object looks like
 * @param {Function} done the callback to call when the user says no or the
 * update completes
 */
function promptModulesUpdate (mismatchedModules, done) {
  const mismatchedModuleOutput = JSON.stringify(mismatchedModules, null, " ");

  const question = {
    type: "confirm",
    name: "confirm",
    message: `${chalk.red("The \`gluestick\` CLI and your project have mismatching versions of the following modules:")}
${chalk.yellow(mismatchedModuleOutput)}
Would you like to automatically update your project's dependencies to match the CLI?`
  };
  inquirer.prompt([question]).then(function (answers) {
    if (!answers.confirm) { return done(); }
    performModulesUpdate(mismatchedModules, done);
  });
}

/**
 * Given an object of mismatched modules, load up the project's package.json
 * file, update it so the versions match, then install dependencies. Once that
 * completes, the `done` callback is called.
 *
 * @param {Object} mismatchedModules see `fixVersionMismatch` function at the
 * top to see what the object looks like
 * @param {Function} done the callback to call when the user says no or the
 * update completes
 */
function performModulesUpdate (mismatchedModules, done) {
  const projectPackageData = loadProjectPackage();
  let module;
  for (const moduleName in mismatchedModules) {
    module = mismatchedModules[moduleName];
    projectPackageData[module.type][moduleName] = module.required;
  }

  projectPackageData.dependencies = sO(projectPackageData.dependencies);
  projectPackageData.devDependencies = sO(projectPackageData.devDependencies);

  fs.writeFileSync(PROJECT_PACKAGE_LOCATION, JSON.stringify(projectPackageData, null, "  "), "utf8");

  cleanDeps();
  const installProcess = installDeps();
  installProcess.on("close", () => {
    logger.info("node_modules have been updated.");
    done();
  });
}

/**
 * Determine a version meets or exceeds a requirement.
 *
 * @param {String} version the version to test
 * @param {String} requiredVersion the version to test against
 *
 * @return {Boolean}
 */
export function isValidVersion (version, requiredVersion) {
  if (!version) {
    return false;
  }

  // Trim off carrot or other things on the version like `^3.0.1` or `>3.0.1`
  const trimmedVersion = version.replace(/^\D*/, "");
  if (!semver.valid(trimmedVersion)){
    return false;
  }

  return semver.satisfies(trimmedVersion, requiredVersion) || semver.gte(trimmedVersion, requiredVersion);
}

