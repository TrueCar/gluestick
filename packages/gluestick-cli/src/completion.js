#!/usr/bin/env node

/** for dev testing:
  source ../bin/completion.sh && GS_COMP=$PWD
*/
const { join } = require('path');
const { existsSync, readdirSync } = require('fs');
const commanderGlobal = require('./cli').default;

let commanderProject = null;
let entriesJson = null;
let entriesPaths = [];

function commanderBases(commander) {
  return commander.commands
    .map(comm => comm._name)
    .filter(name => name !== '*')
    .sort();
}

function commanderArgs(commander, name) {
  const command = commander.commands.find(comm => comm._name === name);
  return command ? command._args : [];
}

function commanderOpts(commander, name) {
  const command = commander.commands.find(comm => comm._name === name);
  return command
    ? command.options.reduce(
        (opts, curr) => opts.concat([curr.short, curr.long].filter(v => !!v)),
        [],
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
      commands: project.map(command => ({
        _name: command,
        options: [],
        _args: [],
      })),
    };
    let localInstalledVersion = 'n/a';
    try {
      const reqPath = join(cwd, 'node_modules', 'gluestick', 'package.json');
      localInstalledVersion = require(reqPath).version;
    } catch (e) {
      // noop
    }
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
        // //console.log(commanderProject.commands.find(c => c._name === "generate"));
      } catch (e) {
        // noop
      }
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
    } catch (e) {
      // noop
    }
  }
  if (!entriesPaths.length) {
    entriesPaths = readdirSync(join(cwd, 'src', 'apps')).map(dir => `/${dir}`);
  }
}

function projectSubcommand(command, words) {
  const args = commanderArgs(commanderProject, command);
  const opts = commanderOpts(commanderProject, command);
  const appFlags = ['-E', '--entryPoints', '-A', '--app'];
  let apps;
  // console.log(command, "stuff", words, args);
  switch (command) {
    case 'generate': // eslint-disable-line no-case-declarations
      apps = Object.keys(entriesJson).map(appPath => `apps${appPath}`);
      const genArg = args.length ? args[0].name.split('|') : [];
      if (words.length === 0) {
        return genArg;
      } else if (words.length === 1) {
        if (genArg.includes(words[0])) {
          if (words[0] !== 'component') {
            opts.splice(opts.indexOf('-F'), 1);
            opts.splice(opts.indexOf('--functional'), 1);
          }
          return opts;
        } else if (appFlags.includes(words[0])) {
          return apps;
        } else if (opts.includes(words[0])) {
          const i = opts.indexOf(words[0]);
          words[0].match('^--') ? opts.splice(i - 1, 2) : opts.splice(i, 2); // eslint-disable-line no-unused-expressions
          return opts;
        } else if (words[0].match(/^-/)) {
          return opts;
        }
        return genArg;
      }
      const last = words.slice(-1)[0];
      const prev = words.slice(-2)[0];
      if (appFlags.includes(last) || appFlags.includes(prev)) {
        return apps;
      } else if (last.match(/^-/)) {
        if (!words.includes('component')) {
          opts.splice(opts.indexOf('-F'), 1);
          opts.splice(opts.indexOf('--functional'), 1);
        }
        return opts;
      }
      return genArg;

    case 'start':
      apps = Object.keys(entriesJson).map(appPath => entriesJson[appPath].name);
      if (words.length === 0) {
        return opts;
      } else if (words.length === 1 && appFlags.includes(words[0])) {
        return apps;
      } else if (appFlags.includes(words.slice(-2)[0])) {
        return apps;
      }
      return opts;
    case 'build': // eslint-disable-line no-case-declarations
      const withArgs = ['-Z', '--static'];
      if (words.length > 1) {
        if (appFlags.includes(words.slice(-2, 1)[0])) {
          if (entriesPaths.includes(words.slice(-1)[0])) {
            return opts;
          }
          return entriesPaths;
        } else if (appFlags.includes(words.slice(-1)[0])) {
          return entriesPaths;
        } else if (withArgs.includes(words.slice(-2, 1)[0])) {
          return [];
        }
      } else if (words.length === 1) {
        if (appFlags.includes(words[0])) {
          return entriesPaths;
        } else if (withArgs.includes(words[0])) {
          return [];
        }
      }
      return opts;
    default:
      return opts;
  }
}

function globalSubcommand(command, words) {
  const args = commanderArgs(commanderGlobal, command);
  const opts = commanderOpts(commanderGlobal, command);
  const requiredCount = args.reduce(
    (count, arg) => (arg.required ? count + 1 : count),
    0,
  );
  let satisfiedCount = 0;
  //  console.log("opts and args", opts, args);
  switch (command) {
    case 'new': // eslint-disable-line no-case-declarations
      if (words.length === 0) {
        return []; // appname required
      }
      for (let i = 0; i < words.length; ++i) {
        if (words[i].match(/^-/)) {
          if (words[i] === '-d') {
            i++;
          } else {
            satisfiedCount++;
          }
        } else {
          satisfiedCount++;
        }
      }

      const word = words.pop();
      const devs = ['-d', '--dev'];
      if (
        devs.includes(word) ||
        (words.length && devs.includes(words.slice(-1)))
      ) {
        // completing a relative path
        return [];
      } else if (
        words.reduce((devComplete, w) => devs.includes(w) || devComplete, false)
      ) {
        // --dev and option specified; complete others
        opts.splice(opts.indexOf('-d'), 2); // eslint-disable-line no-unused-expression;
      }

      if (opts.includes(word)) {
        // include required value
        const i = opts.indexOf(word);
        word.match('^--') ? opts.splice(i - 1, 2) : opts.splice(i, 2); // eslint-disable-line no-unused-expressions
        return opts;
      } else if (word.match(/^-/)) {
        return opts;
      } else if (satisfiedCount === requiredCount) {
        return opts;
      }

      return [];

    default:
      return opts;
  }
}

function complete(cwd, words) {
  let options = [];
  const local = existsSync(join(cwd, 'node_modules', '.bin', 'gluestick'));
  const bases = commanderBases(
    local ? loadCommanderProject(cwd) : commanderGlobal,
  );
  if (local) {
    loadEntries(cwd);
  }

  const subcommand = local ? projectSubcommand : globalSubcommand;

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
