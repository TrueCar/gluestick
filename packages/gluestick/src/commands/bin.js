/* @flow */
import type { Context } from '../types.js';

const spawn = require('cross-spawn');

// Creates patch to dependency's bin directory
const getDependencyPath = name =>
  `${require.resolve(name).split(name)[0]}.bin/${name}`;

// `opts` is array of options with Command object attached as last element
module.exports = (context: Context, dependencyName: string, ...opts: any[]) => {
  spawn(
    getDependencyPath(dependencyName),
    opts[opts.length - 1].parent.rawArgs.slice(4),
    {
      stdio: 'inherit',
    },
  );
};
