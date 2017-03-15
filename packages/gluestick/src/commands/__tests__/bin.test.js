jest.mock('cross-spawn', () => jest.fn(() => ({ on: jest.fn() })));

const path = require('path');
const bin = require('../bin');
const spawnMock = require('cross-spawn');

const spawnOptions = { stdio: 'inherit' };

const getDependencyPath = name =>
  path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', name);

describe('cli: gluestick bin', () => {
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

  it('should return permaturely if dependency name is invalid', () => {
    const context = { logger: { error: jest.fn() } };
    bin(context, 1);
    expect(context.logger.error.mock.calls[0]).toEqual(['No binary is specified or is invalid']);
  });
});
