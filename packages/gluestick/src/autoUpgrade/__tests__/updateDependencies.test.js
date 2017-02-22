/* @flow */
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));
jest.mock('../../lib/npmDependencies.js', () => ({
  install: jest.fn(),
  cleanSync: jest.fn(),
}));
const updateDependencies = require('../updateDependencies');
const fs = require('fs');

test('autoUpgrade/updateDependencies should update package and install', () => {
  const logger = {
    success: jest.fn(),
  };
  const projectPackage = {
    dependencies: {
      depA: '1.0.0',
      depB: '1.0.0',
    },
  };
  const mismatchedModules = {
    depA: {
      required: '2.0.0',
      project: '1.0.0',
      type: 'dependencies',
    },
    depC: {
      required: '1.0.0',
      project: 'missing',
      type: 'devDependencies',
    },
  };
  // $FlowIgnore
  updateDependencies(logger, projectPackage, mismatchedModules);
  const updatedPackage = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
  expect(updatedPackage.dependencies).toEqual({
    depA: '2.0.0',
    depB: '1.0.0',
  });
  expect(updatedPackage.devDependencies).toEqual({
    depC: '1.0.0',
  });
});
