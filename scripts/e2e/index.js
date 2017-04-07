const execSync = require('child_process').execSync;
const path = require('path');
const spawn = require('./utils/spawn');

const CWD = path.join(process.cwd(), '../', 'e2eApp');

module.exports = () => {
  execSync('npm install -g ./packages/gluestick-cli', { stdio: 'inherit' });

  spawn('gluestick', [
    'new',
    'e2eApp',
    '--npm',
    '--dev',
    './gluestick',
  ], {}, path.join(process.cwd(), '../'))
  .then(() => {
    return spawn('gluestick', [
      'generate', 'app', 'secondApp',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'component', 'MyComponent',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'container', 'MyContainer', '-E', 'shared',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'reducer', 'myReducer',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'component', 'MyComponent', '-E', 'apps/secondApp',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'container', 'MyContainer', '-E', 'apps/secondApp',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'generate', 'reducer', 'myReducer', '-E', 'apps/secondApp',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'test',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('npm', [
      'run', 'lint',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('npm', [
      'run', 'flow',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'destroy', 'component', 'MyComponent',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'destroy', 'container', 'MyContainer', '-E', 'apps/secondApp',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'test',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'build',
    ], {}, CWD);
  })
  .then(() => {
    return spawn('gluestick', [
      'build',
    ], { NODE_ENV: 'production' }, CWD);
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
};
