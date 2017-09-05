#!/usr/bin/env node

/** for dev testing:
  source ../bin/completion.sh && GS_COMP=$PWD
*/
const { join } = require('path');
const { existsSync } = require('fs');
const commanderGlobal = require('./cli').default;

let commanderProject = null;
let entriesJson = null;

function commanderBases(commander) {
  return commander.commands
    .map(comm => comm._name)
    .filter(name => name !== '*')
    .sort();
}

function commanderArgs(commander, name) {
  const command = commander.commands
    .find(comm => comm._name === name);
  return command ? command._args : [];    
}

function commanderOpts(commander, name) {
  const command = commander.commands
    .find(comm => comm._name === name);
  return command ? 
    command.options.reduce(
      (opts, curr) => opts.concat([curr.short, curr.long]),
      []
    )
    : [];
}

function loadCommanderProject(cwd) {
  if (!commanderProject) {
    const completionVersion = '1.14'; // TODO: update me
    const project = [
      'auto-upgrade',
      'bin',
      'build',
      'destroy',
      'dockerize',
      'generate',
      'start',
      'start-client',
      'start-server',
      'test',
      `you_should_update_the_gluestick_dependency_to_at_least_${completionVersion}`, // evidence that the project load failed
    ];
    // set this default in case reflection fails.
    commanderProject = {
      commands: project.map(command => ({ _name: command, options: [], _args: [] })),
    };
    let localInstalledVersion = 'n/a';
    try {
      const reqPath = join(cwd, 'node_modules', 'gluestick', 'package.json');
      localInstalledVersion = require(reqPath).version;
    } catch (e) {}
    // If we attempt to require() the cli before this version, we will execute this line:
    // commander.parse(process.argv)
    // ...which would be very bad.  So only require this file if gluestick has been updated.
    if (
      localInstalledVersion !== 'n/a' &&
      localInstalledVersion >= completionVersion
    ) {
      try {
        const reqPath = join(cwd, 'node_modules', 'gluestick', 'build', 'cli');
        commanderProject = require(reqPath).default;
	////console.log(commanderProject.commands.find(c => c._name === "generate"));
      } catch (e) {}
    }
  }
  return commanderProject;
}

function loadEntries(cwd) {
  if (!entriesJson) {
    entriesJson = {};
    try {
      const reqPath = join(cwd, 'src', 'entries.json');
      entriesJson = require(reqPath);
    } catch (e) {}
  }
}

function subcommand(command, words) {
  const args = commanderArgs(commanderProject, command);
  const opts = commanderOpts(commanderProject, command);
  const appFlags = ['-E', '--entryPoints', '-A', '--app'];
  let apps;
  //console.log(command, "stuff", words, args);
  switch (command) {
    case 'generate':
      apps = Object.keys(entriesJson).map(appPath => `apps${appPath}`);
      const genArg = args.length ? args[0].name.split("|") : [];
      if (words.length === 0) {
        return genArg;
      } else if (words.length === 1 ) {
        if ( genArg.includes(words[0]) ){
	  if (words[0] !== "component") {
            opts.splice(opts.indexOf('-F'), 1)
	    opts.splice(opts.indexOf('--functional'), 1);
	  }
          return opts;
	} else if (appFlags.includes(words[0])) {
          return apps;
	} else if (opts.includes(words[0])) {
	  const i = opts.indexOf(words[0]);
	  words[0].match('^--') ? opts.splice(i - 1, 2) : opts.splice(i, 2);
          return opts;
	} else if (words[0].match(/^-/)) {
          return opts;
	} else {
	  return genArg;
	}
      } else {
        const last = words.slice(-1)[0];
	const prev = words.slice(-2)[0];
        if (appFlags.includes(last) || appFlags.includes(prev)){
          return apps;
	} else if (last.match(/^-/)) {
	  if (!words.includes("component")) {
            opts.splice(opts.indexOf('-F'), 1)
	    opts.splice(opts.indexOf('--functional'), 1);
	  }
          return opts;
	} else {
          return genArg;
	}
      }
    case 'start':
      apps = Object.keys(entriesJson).map(appPath => entriesJson[appPath].name);
      if (words.length === 1 && appFlags.includes(words[0])) {
        return apps;
      }
      return opts;
    default:
      return [];
  }
}

function complete(cwd, words) {
  let options = [];
  const local = existsSync(join(cwd, 'node_modules', '.bin', 'gluestick'));
  const bases = commanderBases( local
      ? loadCommanderProject(cwd)
      : commanderGlobal,
  );
  if (local) { 
    loadEntries(cwd);
  }

  if (words.length === 0) {
    options = bases;
  } else if (words.length === 1) {
    if (!bases.includes(words[0])) {
      options = bases;
    } else {
      options = subcommand(words[0], []);
    }
  } else if (bases.includes(words[0])) {
    options = subcommand(words[0], words.slice(1));
  }

  return options;
}

if (require.main === module) {
  // discard nodejs bin path, script name, and the first cli word "gluestick"
  const [, , cwd, , ...words] = process.argv;
  const options = complete(cwd, words);
  process.stdout.write(`${options.join('\n')}\n`);
} else {
  exports.default = complete;
  exports.reload = () => {
    commanderProject = null;
  }; // test support for un-memoizing
}
