#!/usr/bin/env node

/** for dev testing:
  source ../bin/completion.sh && GS_COMP=$PWD
*/
const { join } = require("path");
const { existsSync } = require("fs");
const commanderGlobal = require("./cli").default;
let commanderProject = null;

function commanderBases(commander) {
  return commander.commands
    .map((comm) => comm._name)
    .filter((name) => name !== "*")
    .sort();
}

function loadCommanderProject(cwd) {
  if (!commanderProject){
    const completionVersion = "1.14"; //TODO: update me
    const project = [
      "bin",
      "build",
      "destroy",
      "dockerize",
      "generate",
      "start",
      "start-client",
      "start-server",
      "test",
      `you_should_update_the_gluestick_dependency_to_at_least_${completionVersion}`, // evidence that the project load failed
    ];
    // set this default in case reflection fails.
    commanderProject = { commands: project.map(command => ({_name: command})) };
    let localInstalledVersion = "n/a";
    try {
      const reqPath = join(cwd, "node_modules", "gluestick", "package.json");
      localInstalledVersion = require(reqPath).version
    } catch (e) {
    }
    // If we attempt to require() the cli before this version, we will execute this line:
    // commander.parse(process.argv)
    // ...which would be very bad.  So only require this file if gluestick has been updated.
    if (localInstalledVersion !== "n/a" && localInstalledVersion >= completionVersion){
      try {
        const reqPath = join(cwd, "node_modules", "gluestick", "build", "cli");
        commanderProject = require(reqPath).default
      } catch (e) {
      }
    }
  }
  return commanderProject;
}

function subcommand (command, words) {
  switch (command) {
    case "generate":
      return [
        "component",
	"container",
	"reducer"
      ];
    default:
      return [];
  }
}

function complete (cwd, words) {
 
  let options = [];

  const bases = commanderBases(
    existsSync(join(cwd, "node_modules", ".bin", "gluestick")) ?
      loadCommanderProject(cwd) :
      commanderGlobal
  );
  
  if (words.length === 0){
    options = bases;
  } else if (words.length === 1){
    if ( ! bases.includes( words[0] ) ){
      options = bases;
    } else {
      options = subcommand( words[0], [] ); 
    }
  } else {
    if ( bases.includes( words[0] ) ){
      options = subcommand( words[0], words.slice(1) );
    }
  }
  
  return options;
}

if (require.main === module) {
  // discard nodejs bin path, script name, and the first cli word "gluestick"
  const [, , cwd, , ...words] = process.argv;
  const options = complete(cwd, words);
  process.stdout.write(options.join("\n")+"\n");
} else {
  module.exports.default = complete;
}

