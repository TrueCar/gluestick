jest.mock('cross-spawn', () => jest.fn(() => ({ on: jest.fn() })));

const path = require('path');
const bin = require('../bin');
const spawnMock = require('cross-spawn');

const spawnOptions = { stdio: 'inherit' };

const testCwdPath = 'test-cwd';

const getDependencyPath = name =>
  path.join(testCwdPath, 'node_modules', '.bin', name);

const originalProcessCwd = process.cwd.bind(process);

describe('cli: gluestick bin', () => {
  beforeEach(() => {
    process.cwd = jest.fn(() => testCwdPath);
  });

  afterAll(() => {
    process.cwd = originalProcessCwd;
  });

  it('runs the dependency without any options', () => {
    const dependencyName = 'fakeDep';

    bin({}, dependencyName, { parent: { rawArgs: [] } });
    expect(spawnMock).toBeCalledWith(getDependencyPath(dependencyName), [], spawnOptions);
  });

  it('runs the dependency with specified options options', () => {
    const dependencyName = 'fakeDep';
    const dependencyOptions = ['test', '-T', '--test'];
    const commanderObject = {
      parent: { rawArgs: ['', '', '', '', ...dependencyOptions] },
    };

    bin({}, dependencyName, ...dependencyOptions, commanderObject);
    expect(spawnMock).toBeCalledWith(
      getDependencyPath(dependencyName), dependencyOptions, spawnOptions,
    );
  });
});
