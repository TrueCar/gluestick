/* @flow */
import type { Logger } from '../../../types.js';

const mockedCommandApi = require('../../../__tests__/mocks/context').commandApi;
const compareModuleVersions = require('../compareModuleVersions');
const path = require('path');

const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
  }),
};
const logger: Logger = commandApi.getLogger();
const modulePath = path.join(
  process.cwd(),
  'packages/gluestick/src/commands/compareVersions/__tests__/modules',
);

// Test package.jsons
const emptyPackage = {};

const devDependencyPackage = {
  // hardcoded to always be smaller than required versions
  dependencies: {},
  devDependencies: {
    eslint: '0.0.0',
    glob: '7.1.0',
    mkdirp: '25.5.2',
    rimraf: '2.6.1',
  },
};
const projectPackageCorrect = {
  // assumes that node_modules are up to date with package.json
  dependencies: {
    lerna: '2.0.0-rc.5',
  },
  devDependencies: {
    eslint: '^3.19.0',
    glob: '7.1.1',
    mkdirp: '0.5.1',
    rimraf: '2.6.1',
  },
};

const projectPackageIncorrect = {
  dependencies: {
    lerna: '2.0.0-rc.5',
  },
  devDependencies: {
    eslint: '0.0.0',
    glob: '7.1.0',
    mkdirp: '25.5.2',
    rimraf: '2.6.1',
  },
};

const requireCall = tempPath => {
  const fileName = path.basename(path.dirname(tempPath));
  if (fileName === 'lerna') {
    return {
      _from: 'lerna@2.0.0-rc.5',
      version: '2.0.0-rc.5',
    };
  } else if (fileName === 'eslint') {
    return {
      _from: 'eslint@3.19.0',
      version: '3.19.0',
    };
  } else if (fileName === 'glob') {
    return {
      _from: 'glob@7.1.1',
      version: '7.1.1',
    };
  } else if (fileName === 'mkdirp') {
    return {
      _from: 'mkdirp@0.5.1',
      version: '0.5.1',
    };
  }
  return {
    _from: 'rimraf@2.6.1',
    version: '2.6.1',
  };
};

describe('compareVersions/compareModuleVersions', () => {
  it('should return an empty array if package is empty', () => {
    expect(
      compareModuleVersions(emptyPackage, modulePath, logger, requireCall),
    ).toEqual([]);
  });

  it('should return an array with only devDependencies', () => {
    expect(
      compareModuleVersions(
        devDependencyPackage,
        modulePath,
        logger,
        requireCall,
      ),
    ).toEqual([
      { found: '3.19.0', name: 'eslint', required: '0.0.0' },
      { found: '7.1.1', name: 'glob', required: '7.1.0' },
      { found: '0.5.1', name: 'mkdirp', required: '25.5.2' },
    ]);
  });

  it('should detect no mismatched modules', () => {
    expect(
      compareModuleVersions(
        projectPackageCorrect,
        modulePath,
        logger,
        requireCall,
      ),
    ).toEqual([]);
  });

  it('should detect 3 mismatched modules', () => {
    expect(
      compareModuleVersions(
        projectPackageIncorrect,
        modulePath,
        logger,
        requireCall,
      ),
    ).toEqual([
      { found: '3.19.0', name: 'eslint', required: '0.0.0' },
      { found: '7.1.1', name: 'glob', required: '7.1.0' },
      { found: '0.5.1', name: 'mkdirp', required: '25.5.2' },
    ]);
  });
});
