/* eslint-disable comma-dangle */

const path = require('path');
const spawn = require('./utils/spawn');
const exec = require('./utils/exec');
const assertions = require('./utils/assertions');

const CWD = path.join(process.cwd(), '../e2eApp');

process.on('uncaughtException', (error) => {
  console.error(error);
  process.exit(1);
});

module.exports = () => {
  exec('sudo npm install -g ./packages/gluestick-cli');
  exec(
    'sudo npm install ~/gluestick/packages/gluestick-generators',
    '/usr/local/lib/node_modules/gluestick-cli'
  );

  // New project with npm
  exec('gluestick new e2eApp --dev ./gluestick', path.dirname(CWD));
  exec('rm node_modules/gluestick/.babelrc', CWD);
  // New apps (camel and kebab case)
  exec('gluestick generate app secondApp', CWD);
  exec('gluestick generate app third-app', CWD);
  // Generate component
  exec('gluestick generate component MyComponent', CWD);
  assertions.exists(
    `${CWD}/src/apps/main/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  exec('gluestick generate component MyComponent -E shared', CWD);
  assertions.exists(
    `${CWD}/src/shared/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  exec('gluestick generate component MyComponent -E apps/secondApp', CWD);
  assertions.exists(
    `${CWD}/src/apps/secondApp/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  // Generate container
  exec('gluestick generate container MyContainer', CWD);
  assertions.exists(
    `${CWD}/src/apps/main/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  exec('gluestick generate container MyContainer -E shared', CWD);
  assertions.exists(
    `${CWD}/src/shared/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  exec('gluestick generate container MyContainer -E apps/secondApp', CWD);
  assertions.exists(
    `${CWD}/src/apps/secondApp/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  // Generate reducer
  exec('gluestick generate reducer myReducer', CWD);
  assertions.exists(
    `${CWD}/src/apps/main/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  exec('gluestick generate reducer myReducer -E shared', CWD);
  assertions.exists(
    `${CWD}/src/shared/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  exec('gluestick generate reducer myReducer -E apps/secondApp', CWD);
  assertions.exists(
    `${CWD}/src/apps/secondApp/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  // Generate generator
  exec('gluestick generate generator myGenerator', CWD);
  assertions.exists(
    `${CWD}/generators`,
    'myGenerator.js'
  );
  // Lint, flow, test
  exec('npm run lint', CWD);
  exec('npm run flow', CWD);
  exec('gluestick test', CWD);
  // Build in dev and prod bundles
  exec('gluestick build', CWD);
  exec('gluestick build', CWD, { NODE_ENV: 'production' });
  // Destory component
  exec('gluestick destroy component MyComponent', CWD);
  assertions.notExists(
    `${CWD}/src/apps/main/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  exec('gluestick destroy component MyComponent -E shared', CWD);
  assertions.notExists(
    `${CWD}/src/shared/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  exec('gluestick destroy component MyComponent -E apps/secondApp', CWD);
  assertions.notExists(
    `${CWD}/src/apps/secondApp/components`,
    'MyComponent.js',
    '__tests__/MyComponent.test.js'
  );
  // Destory container
  exec('gluestick destroy container MyContainer', CWD);
  assertions.notExists(
    `${CWD}/src/apps/main/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  exec('gluestick destroy container MyContainer -E shared', CWD);
  assertions.notExists(
    `${CWD}/src/shared/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  exec('gluestick destroy container MyContainer -E apps/secondApp', CWD);
  assertions.notExists(
    `${CWD}/src/apps/secondApp/containers`,
    'MyContainer.js',
    '__tests__/MyContainer.test.js'
  );
  // Destroy reducer
  exec('gluestick destroy reducer myReducer', CWD);
  assertions.notExists(
    `${CWD}/src/apps/main/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  exec('gluestick destroy reducer myReducer -E shared', CWD);
  assertions.notExists(
    `${CWD}/src/shared/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  exec('gluestick destroy reducer myReducer -E apps/secondApp', CWD);
  assertions.notExists(
    `${CWD}/src/apps/secondApp/reducers`,
    'myReducer.js',
    '__tests__/myReducer.test.js'
  );
  // Lint, flow, test after removal of components, containers and reducers
  exec('npm run lint', CWD);
  exec('npm run flow', CWD);
  exec('gluestick test', CWD);
  // Build in dev and prod bundles after removal of components, containers and reducers
  exec('gluestick build', CWD);
  exec('gluestick build', CWD, { NODE_ENV: 'production' });
  // Run bin command
  spawn('gluestick bin gluestick -V', CWD, {}, 'pipe').then(({ stdout }) => {
    console.log(stdout);
    if (!stdout.includes(require('../../lerna.json').version)) {
      throw new Error('gluestick version from `bin` command does not contain version from `lerna.json`');
    }
    return Promise.resolve();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
};
