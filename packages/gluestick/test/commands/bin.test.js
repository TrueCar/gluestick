import crossSpawn from 'cross-spawn';
import path from 'path';

import bin from '../../src/commands/bin';

const spawnOptions = { stdio: 'inherit' };

const getDependencyPath = name =>
  path.join(__dirname, '..', '..', 'node_modules', '.bin', name);


describe('cli: gluestick bin', () => {
  beforeAll(() => {
    crossSpawn.spawn = jest.fn();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('runs the dependency without any options', () => {
    const dependencyName = 'fakeDep';

    bin(dependencyName);
    expect(crossSpawn.spawn).toBeCalledWith(getDependencyPath(dependencyName), [], spawnOptions);
  });

  it('runs the dependency with specified options options', () => {
    const dependencyName = 'fakeDep';
    const dependencyOptions = ['test', '-T', '--test'];
    const commanderObject = {};

    bin(dependencyName, ...dependencyOptions, commanderObject);
    expect(crossSpawn.spawn).toBeCalledWith(
      getDependencyPath(dependencyName), dependencyOptions, spawnOptions,
    );
  });
});
