/* @flow */
import type { Context } from '../types.js';

const spawn = require('cross-spawn');
const path = require('path');

// Creates patch to dependency's bin directory
const getDependencyPath = name =>
  path.join(process.cwd(), 'node_modules/.bin/', name);

// `opts` is array of options with Command object attached as last element
module.exports = (context: Context, dependencyName: string, ...opts: any[]) => {
  if (typeof dependencyName !== 'string') {
    context.logger.error('No binary is specified or is invalid');
    context.logger.error('Syntax for this command is `gluestick bin <binaryName>`');
    return;
  }
  spawn(
    getDependencyPath(dependencyName),
    opts[opts.length - 1].parent.rawArgs.slice(4),
    {
      stdio: 'inherit',
    },
  ).on('error', (error) => {
    if (error.code === 'ENOENT') {
      context.logger.error(`No binary found for ${dependencyName}`);
    } else {
      throw error;
    }
  });
};
