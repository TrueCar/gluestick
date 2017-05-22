/* @flow */
jest.mock('../getSingleEntryFromGenerator.js', () => (path, name, options) => {
  return {
    dependencies: {
      ...options.gluestickDependencies,
      ...options.presetDependencies.dependencies,
    },
    devDependencies: options.presetDependencies.devDependencies,
  };
});
jest.mock('gluestick-generators', () => ({
  parseConfig: v => ({ entry: { template: JSON.stringify(v.entry) } }),
}));
jest.mock('fs', () => ({
  readFileSync: () => JSON.stringify({
    version: '1.9.3',
    gsProjectDependencies: {
      dependencies: {
        depA: '2.0.0',
        depB: '1.0.0',
      },
      devDependencies: {
        depC: '1.0.0',
      },
    },
  }),
}));

const utils = require('../utils');
const checkForMismatch = require('../checkForMismatch');

const orignialPromptModulesUpdate = utils.promptModulesUpdate;

describe('autoUpgrade/checkForMismatch', () => {
  beforeEach(() => {
    utils.promptModulesUpdate = jest.fn(() => Promise.resolve(true));
  });

  afterEach(() => {
    jest.resetAllMocks();
    utils.promptModulesUpdate = orignialPromptModulesUpdate;
  });

  it('should detect mismatched modules from preset module', () => {
    // $FlowIgnore
    return checkForMismatch({
      dependencies: {
        depA: '1.0.0',
        depB: '1.0.0',
      },
    }).then(result => {
      expect(result).toBeTruthy();
      // $FlowIgnore
      expect(utils.promptModulesUpdate.mock.calls[0][0]).toEqual({
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
      });
    });
  });

  it('should detect mismatched modules from api request', () => {

  });
});
