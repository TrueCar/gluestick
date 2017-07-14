/* @flow */
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}));
jest.mock('inquirer', () => ({
  prompt: () => Promise.resolve({ confirm: true }),
}));
const {
  isValidVersion,
  replaceFile,
  promptModulesUpdate,
} = require('../utils');
const fs = require('fs');
const path = require('path');

describe('autoUpgrade/utils.isValidVersion', () => {
  it('should return true when version is greater than or equal requiredVersion', () => {
    expect(isValidVersion('10.0.0', '1.0.0')).toEqual(true);
    expect(isValidVersion('0.0.2', '0.0.1')).toEqual(true);
    expect(isValidVersion('2.1.1', '2.1.1')).toEqual(true);
  });

  it('should return false when version is null or undefined', () => {
    const o = {};
    // $FlowIgnore
    expect(isValidVersion(null, '1.0.0')).toEqual(false);
    expect(isValidVersion(o.version, '0.0.1')).toEqual(false);
  });

  it('should return false when version does not meet requirement', () => {
    expect(isValidVersion('10.0.0', '11.0.0')).toEqual(false);
    expect(isValidVersion('0.0.2', '0.0.3')).toEqual(false);
    expect(isValidVersion('2.1.1', '2.1.2')).toEqual(false);
  });

  it('should return true when version is valid but starts with carrot or similar', () => {
    expect(isValidVersion('~10.0.0', '8.0.0')).toEqual(true);
    expect(isValidVersion('>=10.0.0', '8.0.0')).toEqual(true);
    expect(isValidVersion('>0.0.2', '0.0.1')).toEqual(true);
    expect(isValidVersion('^2.1.1', '2.1.1')).toEqual(true);
  });

  it('should return false when version starts with carrot or similar but is still too far behind', () => {
    expect(isValidVersion('~10.0.0', '11.0.0')).toEqual(false);
    expect(isValidVersion('>=10.0.0', '11.0.0')).toEqual(false);
    expect(isValidVersion('>0.0.2', '0.0.3')).toEqual(false);
    expect(isValidVersion('^2.1.1', '2.5.1')).toEqual(false);
  });

  it('should return false if version is invalid', () => {
    expect(isValidVersion('a.b.c', '')).toBeFalsy();
  });
});

describe('autoUpgrade/utils.replaceFile', () => {
  it('should replace file', () => {
    // $FlowIgnore only info from logger is used
    replaceFile(
      {
        info: jest.fn(),
      },
      'test',
      'data',
    );
    expect(fs.writeFileSync.mock.calls[0]).toEqual([
      path.join(process.cwd(), 'test'),
      'data',
    ]);
  });
});

describe('autoUpgrade/utils.promptModulesUpdate', () => {
  it('should replace file', done => {
    const mismatchedModules = {
      dep0: {
        required: '1.0.0',
        project: '0.0.0',
        type: 'dependency',
      },
    };
    promptModulesUpdate(mismatchedModules).then(results => {
      expect(results).toEqual({
        shouldFix: true,
        mismatchedModules,
      });
      done();
    });
  });
});
