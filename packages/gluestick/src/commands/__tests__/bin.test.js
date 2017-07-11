jest.mock('cross-spawn', () => jest.fn(() => ({ on: jest.fn() })));

const path = require('path');
const bin = require('../bin');
const spawnMock = require('cross-spawn');

const mockedCommandApi = require('../../__tests__/mocks/context').commandApi;

const errorLogger = jest.fn();
const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
    error: errorLogger,
  }),
};

const spawnOptions = { stdio: 'inherit' };

const getDependencyPath = name =>
  path.join(process.cwd(), 'node_modules', '.bin', name);

describe('cli: gluestick bin', () => {
  it('runs the dependency without any options', () => {
    const dependencyName = 'fakeDep';

    bin(commandApi, [dependencyName, { parent: { rawArgs: [] } }]);
    expect(spawnMock).toBeCalledWith(
      getDependencyPath(dependencyName),
      [],
      spawnOptions,
    );
  });

  it('runs the dependency with specified options options', () => {
    const dependencyName = 'fakeDep';
    const dependencyOptions = ['test', '-T', '--test'];
    const commanderObject = {
      parent: { rawArgs: ['', '', '', '', ...dependencyOptions] },
    };

    bin(commandApi, [dependencyName, ...dependencyOptions, commanderObject]);
    expect(spawnMock).toBeCalledWith(
      getDependencyPath(dependencyName),
      dependencyOptions,
      spawnOptions,
    );
  });

  it('should return permaturely if dependency name is invalid', () => {
    bin(commandApi, [1]);
    expect(errorLogger.mock.calls[0]).toEqual([
      'No binary is specified or is invalid',
    ]);
  });
});
