#!/usr/bin/env node

/** for dev testing:
  source ../bin/completion.sh && GS_COMP=$PWD
*/
const { join } = require("path");
const { existsSync } = require("fs");

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

  const global = [
    "new",
    "reinstall-dev",
    "reset-hard",
    "watch",
  ];
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
  ];
  
  const bases = existsSync(join(cwd, "node_modules", ".bin", "gluestick")) ? project : global;
  
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

