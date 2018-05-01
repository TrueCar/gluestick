/* @flow */
jest.mock('../getSingleEntryFromGenerator.js', () => jest.fn());
jest.mock('gluestick-generators', () => ({
  parseConfig: () => ({
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
  }),
}));

const utils = require('../utils');

const originalPromptModulesUpdate = utils.promptModulesUpdate;

describe('autoUpgrade/checkForMismatch', () => {
  let checkForMismatch;
  beforeEach(() => {
    utils.promptModulesUpdate = jest.fn(() =>
      Promise.resolve({ shouldFix: false, mismatchedModules: {} }),
    );
    checkForMismatch = require('../checkForMismatch');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    utils.promptModulesUpdate = originalPromptModulesUpdate;
  });

  it('detects mismatched modules', () => {
    return checkForMismatch(
      {
        dependencies: {
          depA: '1.0.0',
          depB: '1.0.0',
        },
        devDependencies: {},
      },
      false,
    ).then(result => {
      expect(result).toBeTruthy();
      expect(utils.promptModulesUpdate).toHaveBeenCalledWith({
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

  it('ignores local file dependencies', () => {
    return checkForMismatch(
      {
        dependencies: {
          depA: 'file:../gluestick/packages/gluestick',
          depB: '1.0.0',
        },
        devDependencies: {
          depC: '1.0.0',
        },
      },
      false,
    ).then(result => {
      expect(result).toBeTruthy();
      expect(utils.promptModulesUpdate).not.toHaveBeenCalled();
    });
  });
});
