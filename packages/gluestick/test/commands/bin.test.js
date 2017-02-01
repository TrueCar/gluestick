const spawnMock = jest.fn();
jest.setMock('cross-spawn', spawnMock);

const path = require('path');
const bin = require('../../src/commands/bin');

const spawnOptions = { stdio: 'inherit' };

const getDependencyPath = name =>
  path.join(__dirname, '..', '..', 'node_modules', '.bin', name);

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
});
