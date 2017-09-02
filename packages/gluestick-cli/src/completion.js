#!/usr/bin/env node

/** for dev testing:
  source ../bin/completion.js && GS_COMP=$PWD
*/

const { appendFileSync } = require("fs");
const path = require("path");

const OUT_FILE = __dirname + "/comp.out";

function log (){
  // console output would break the completion. tail -f OUT_FILE instead.
  Array.prototype.slice.call(arguments).forEach((item) => {
    appendFileSync(OUT_FILE, item.toString());
  });
  appendFileSync(OUT_FILE, "\n");
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
 
  log("\n\nrunning completion.js\n-------");
  log("CWD: \n\t", cwd);
  log("words:");
  words.forEach((arg, i) => log("\t", i, " ", arg));
  
  let options = [];

  const bases = [
    "build",
    "destroy",
    "dockerize",
    "generate",
    "new",
    "reinstall-dev",
    "reset-hard",
    "start",
    "start-client",
    "start-server",
    "test",
  ];
  
  if (words.length === 0){
    options = bases;
  } else if (words.length === 1){
    if ( ! bases.includes( words[0] ) ){
      log("returning all base commands");
      options = bases;
    } else {
      log("returning subcommands for ", words[0]);
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
  
  const [, , cwd, , ...words] = process.argv;
  const options = complete(cwd, words);
  process.stdout.write(options.join("\n")+"\n");
  log("result:\n\t", options.join("\n\t"));
} else {
  module.exports.default = complete;
}

