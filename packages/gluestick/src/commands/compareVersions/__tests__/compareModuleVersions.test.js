/* @flow */
import type { Logger } from '../types.js';

const mockedCommandApi = require('../../../__tests__/mocks/context').commandApi;
const compareModuleVersions = require('../compareModuleVersions');
const path = require('path');

const projectPath = require(path.join(process.cwd(), 'package.json'));

const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
  }),
};
const logger: Logger = commandApi.getLogger();
const modulePath = path.join(process.cwd(), 'node_modules');

// Test package.jsons
const emptyPackage = {};

const devDependencyPackage =
  { // hardcoded to always be smaller than required versions
    dependencies: {},
    devDependencies: {
      eslint: '0.0.0',
      glob: '7.1.0',
      mkdirp: '25.5.2',
    },
  };
const projectPackageCorrect =
  { // assumes that node_modules are up to date with package.json
    dependencies: {
      lerna: projectPath.dependencies.lerna,
    },
    devDependencies: {
      eslint: projectPath.devDependencies.eslint,
      glob: projectPath.devDependencies.glob,
      mkdirp: projectPath.devDependencies.mkdirp,
      rimraf: projectPath.devDependencies.rimraf,
    },
  };

const projectPackageIncorrect =
  {
    dependencies: {
      lerna: projectPath.dependencies.lerna,
    },
    devDependencies: {
      eslint: '0.0.0',
      glob: '7.1.0',
      mkdirp: '25.5.2',
      rimraf: projectPath.devDependencies.rimraf,
    },
  };

describe('compareVersions/compareModuleVersions', () => {
  it('should return an empty array if package is empty', () => {
    expect(compareModuleVersions(emptyPackage, modulePath, logger)).toEqual([]);
  });

  it('should return an array with only devDependencies', () => {
    expect(compareModuleVersions(devDependencyPackage, modulePath, logger)).toEqual([' eslint', ' glob', ' mkdirp']);
  });

  it('should detect no mismatched modules', () => {
    expect(compareModuleVersions(projectPackageCorrect, modulePath, logger)).toEqual([]);
  });

  it('should detect 3 mismatched modules', () => {
    expect(compareModuleVersions(projectPackageIncorrect, modulePath, logger)).toEqual([' eslint', ' glob', ' mkdirp']);
  });
});
