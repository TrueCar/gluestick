import { spawn } from 'cross-spawn';
import path from 'path';

// Creates patch to dependency's bin directory
const getDependencyPath = name =>
  path.join(__dirname, '..', '..', 'node_modules', '.bin', name);

// `opts` is array of options with Command object attached as last element
module.exports = (dependencyName, ...opts) => {
  spawn(
    getDependencyPath(dependencyName),
    opts.splice(0, opts.length - 1),
    {
      stdio: 'inherit',
    },
  );
};
