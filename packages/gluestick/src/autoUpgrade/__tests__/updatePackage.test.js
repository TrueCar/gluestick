import fixVersionMismatch, { isValidVersion, FIX_VERSION_MISMATCH_OVERRIDES } from '../updatePackage';
import {
  missingProjectPackage,
  invalidProjectPackage,
  validProjectPackage,
  validLargerProjectPackage,
} from '../../../jest/utils/projectPackages';

function mockLoadProjectPackage(fixture) {
  switch (fixture) {
    case 'missing':
      return missingProjectPackage;
    case 'invalid-version':
      return invalidProjectPackage;
    case 'valid-larger':
      return validLargerProjectPackage;
    case 'valid':
    default:
      return validProjectPackage;
  }
}

// @TODO need refactor https://github.com/TrueCar/gluestick/issues/490
describe.skip('autoUpgrade/updatePackage', () => {
  describe('fixVersionMismatch', () => {
    const prompt = jest.fn();
    const overrides = {
      ...FIX_VERSION_MISMATCH_OVERRIDES,
      loadNewProjectPackage: mockLoadProjectPackage.bind(null, 'valid'),
      rejectOnFailure: true,
      promptModulesUpdate: prompt,
    };

    afterEach(() => {
      prompt.mockClear();
    });

    it('should prompt when there is a missing module', async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, 'missing'),
        });
      } catch (e) {
        // NOOP
      }

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt.mock.calls[0][0].axios.project).toEqual('missing');
    });

    it('should prompt when there a module has lower than required version', async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, 'invalid-version'),
        });
      } catch (e) {
        // NOOP
      }

      expect(prompt).toHaveBeenCalledTimes(1);
    });

    it('should not prompt when module version match', async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadNewProjectPackage: mockLoadProjectPackage.bind(null, 'valid'),
          loadProjectPackage: mockLoadProjectPackage.bind(null, 'valid'),
        });
      } catch (e) {
        // NOOP
      }

      expect(prompt).not.toHaveBeenCalled();
    });

    it('should not prompt when module version is larger', async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, 'valid-larger'),
        });
      } catch (e) {
        // NOOP
      }

      expect(prompt).not.toHaveBeenCalled();
    });
  });

  describe('isValidVersion', () => {
    it('should return true when version is greater than or equal requiredVersion', () => {
      expect(isValidVersion('10.0.0', '1.0.0')).toEqual(true);
      expect(isValidVersion('0.0.2', '0.0.1')).toEqual(true);
      expect(isValidVersion('2.1.1', '2.1.1')).toEqual(true);
    });

    it('should return false when version is null or undefined', () => {
      const o = {};
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
  });
});

