/* @flow */
jest.mock('../getSingleEntryFromGenerator.js', () => jest.fn());
jest.mock('gluestick-generators', () => ({
  parseConfig: jest.fn(() => ({
    entry: {
      template: JSON.stringify({
        dependencies: {
          depA: '2.0.0',
          depB: '1.0.0',
        },
        devDependencies: {
          depC: '1.0.0',
        },
      }),
    },
  })),
}));

const utils = require('../utils');
const checkForMismatch = require('../checkForMismatch');

const orignialPromptModulesUpdate = utils.promptModulesUpdate;

describe('autoUpgrade/checkForMismatch', () => {
  beforeEach(() => {
    utils.promptModulesUpdate = jest.fn(() =>
      Promise.resolve({ shouldFix: true, mismatchedModules: {} }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    utils.promptModulesUpdate = orignialPromptModulesUpdate;
  });

  it('should detect mismatched modules', done => {
    // $FlowIgnore
    checkForMismatch({
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
      done();
    });
  });
});
