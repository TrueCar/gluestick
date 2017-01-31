import fs from 'fs';
import temp from 'temp';
import rimraf from 'rimraf';
import logger from '../../src/lib/cliLogger';
import { isGluestickProject, quitUnlessGluestickProject, compareVersions } from '../../src/lib/utils';

describe('utils', () => {
  let originalCwd;
  let tmpDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-utils');
    process.chdir(tmpDir);
  });

  afterEach((done) => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe('isGluestickProject', () => {
    it('should return false if a .gluestick file is not found in the current directory', (done) => {
      expect(isGluestickProject()).toBeFalsy();
      done();
    });

    it('should return true if a .gluestick file is not found in the current directory', (done) => {
      fs.closeSync(fs.openSync('.gluestick', 'w'));
      expect(isGluestickProject()).toBeTruthy();
      done();
    });
  });

  describe('quitUnlessGluestickProject', () => {
    process.exit = jest.fn();
    logger.error = jest.fn();

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should quit the program if run outside of a gluestick project', (done) => {
      quitUnlessGluestickProject('test');
      expect(process.exit).toHaveBeenCalledTimes(1);
      done();
    });

    it('should not quit the program if run inside of a gluestick project', (done) => {
      fs.closeSync(fs.openSync('.gluestick', 'w'));
      quitUnlessGluestickProject('test');
      expect(process.exit).not.toHaveBeenCalled();
      done();
    });


    it('should display an error if run outside of a gluestick project', (done) => {
      quitUnlessGluestickProject('test');
      expect(logger.error.mock.calls[0][0]).toContain('commands must be run from the root of a gluestick project');
      done();
    });

    it('should not display an error if run inside of a gluestick project', (done) => {
      fs.closeSync(fs.openSync('.gluestick', 'w'));
      quitUnlessGluestickProject('test');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
  });

  describe('compareVersions', () => {
    it('returns 1 if the major number of the first arg is greater than the major number of the second arg', () => {
      const versionA = '1.0.0';
      const versionB = '0.0.0';
      expect(compareVersions(versionA, versionB)).toEqual(1);
    });

    it('returns -1 if the major number of the first arg is less than the major number of the second arg', () => {
      const versionA = '0.0.0';
      const versionB = '1.0.0';
      expect(compareVersions(versionA, versionB)).toEqual(-1);
    });

    it('returns 0 if the major number of the first arg equals the major number of the second arg', () => {
      const versionA = '1.0.0';
      const versionB = '1.0.0';
      expect(compareVersions(versionA, versionB)).toEqual(0);
    });

    it('returns -1 if the minor number of the first arg is numerically less than the minor number of the second arg', () => {
      const versionA = '1.8.0';
      const versionB = '1.10.0';
      expect(compareVersions(versionA, versionB)).toEqual(-1);
    });

    it('returns 1 if the minor number of the first arg is numerically greater than the minor number of the second arg', () => {
      const versionA = '1.10.0';
      const versionB = '1.8.0';
      expect(compareVersions(versionA, versionB)).toEqual(1);
    });

    it("returns 1 if the first arg consists of numbers but the second arg doesn't", () => {
      const versionA = '1.0.0';
      const versionB = 'abc';
      expect(compareVersions(versionA, versionB)).toEqual(1);
    });

    it("returns -1 if the first arg doesn't consist of numbers but the second arg does", () => {
      const versionA = 'abc';
      const versionB = '1.0.0';
      expect(compareVersions(versionA, versionB)).toEqual(-1);
    });
  });
});
