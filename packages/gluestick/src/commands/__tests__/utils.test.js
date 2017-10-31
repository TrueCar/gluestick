/* @flow */
jest.mock('rimraf', () => ({
  sync: jest.fn(),
}));
const utils = require('../utils');
const gsConfig = require('../../__tests__/mocks/context').gsConfig;
const rimraf = require('rimraf');

test('commands/utils#filterArgs should exclude given arg from array', () => {
  expect(utils.filterArg(['--arg1', '--arg2'], ['--arg1'])).toEqual(['--arg2']);
});

describe('commands/utils#clearBuildDirecotry', () => {
  beforeEach(() => {
    rimraf.sync.mockClear();
  });

  it('should clear client build dir', () => {
    utils.clearBuildDirectory(
      {
        ...gsConfig,
        buildAssetsPath: 'clientBuildPath',
      },
      'client',
    );
    expect(rimraf.sync).toHaveBeenCalled();
    expect(
      rimraf.sync.mock.calls[0][0].includes('clientBuildPath/!(dlls)'),
    ).toBeTruthy();
  });

  it('should clear server build dir', () => {
    utils.clearBuildDirectory(
      {
        ...gsConfig,
        buildRendererPath: 'serverBuildPath',
      },
      'server',
    );
    expect(rimraf.sync).toHaveBeenCalled();
    expect(
      rimraf.sync.mock.calls[0][0].includes('serverBuildPath/*'),
    ).toBeTruthy();
  });

  it('should throw error', () => {
    expect(() => {
      utils.clearBuildDirectory(gsConfig, 'test');
    }).toThrowError('Invalid build type test');
  });
});
