/* @flow */

jest.mock('../../cli/logger', () => () => ({
  info: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock('../../generator/utils');

const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const temp = require('temp');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

const destroy = require('../destroy');
const logger = require('../../cli/logger')();
const { isValidEntryPoint } = require('../../generator/utils');

function createFiles(...filePaths) {
  filePaths.forEach((pathToFile) => {
    fs.closeSync(fs.openSync(pathToFile, 'w'));
  });
}

function createDirectories(rootDir, ...directories) {
  directories.forEach((directory) => {
    mkdirp.sync(path.join(rootDir, 'src', directory));
    mkdirp.sync(path.join(rootDir, 'src', directory, '__tests__'));
  });
}

describe('cli: gluestick destroy', () => {
  let originalCwd;
  let tmpDir;

  const fileExists = filePath => fs.existsSync(path.join(tmpDir, filePath));
  const context = { config: { plugins: [] }, logger };
  // $FlowFixMe
  isValidEntryPoint.mockReturnValue(true);

  beforeEach(() => {
    logger.error.mockClear();

    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-destroy');
    process.chdir(tmpDir);
    fs.closeSync(fs.openSync('.gluestick', 'w'));
    createDirectories(tmpDir, 'shared/components', 'shared/reducers', 'shared/containers');
  });

  afterEach((done) => {
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe('when files are generated without sub-directories', () => {
    beforeEach(() => {
      const componentPath = path.join(tmpDir, 'src/shared/components/TestComponent.js');
      const componentTestPath = path.join(tmpDir, 'src/shared/components/__tests__/TestComponent.test.js');
      const containerPath = path.join(tmpDir, 'src/shared/containers/TestContainer.js');
      const containerTestPath = path.join(tmpDir, 'src/shared/containers/__tests__/TestContainer.test.js');
      const reducerPath = path.join(tmpDir, 'src/shared/reducers/testReducer.js');
      const reducerTestPath = path.join(tmpDir, 'src/shared/reducers/__tests__/testReducer.test.js');
      createFiles(
        componentPath,
        componentTestPath,
        containerPath,
        containerTestPath,
        reducerPath,
        reducerTestPath,
      );
    });

    describe('when invalid arguments are provided', () => {
      it('reports an error when (container|component|reducer) is not specified', () => {
        // $FlowIgnore flow detects this case but nothing prevents the user to type it
        destroy(context, 'blah', '', { entryPoint: 'shared' });
        expect(logger.error).toBeCalledWith(`${chalk.bold('blah')} is not a valid destroy command.`);
      });

      it('reports an error when a name only consists of whitespace', () => {
        destroy(context, 'component', ' ', { entryPoint: 'shared' });
        expect(logger.error).toBeCalledWith(`${chalk.bold(' ')} is not a valid name.`);
      });

      it('reports an error when the specified name does not exist', () => {
        destroy(context, 'component', 'somethingthatdoesnotexist', { entryPoint: 'shared' });
        expect(logger.error.mock.calls[0][0]).toContain('does not exist');
      });

      it('should ask whether to continue if the name does not match (case sensitive)', async () => {
        inquirer.prompt = jest.fn().mockImplementation(() => Promise.resolve({ confirm: true }));
        await destroy(context, 'component', 'testComponent', { entryPoint: 'shared' });
        expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      });
    });

    describe('when removing files', () => {
      it('removes the specified component and its associated test', () => {
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(true);
        expect(fileExists('src/shared/components/__tests__/TestComponent.test.js')).toEqual(true);
        destroy(context, 'component', 'TestComponent', { entryPoint: 'shared' });
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(false);
        expect(fileExists('src/shared/components/__tests__/TestComponent.test.js')).toEqual(false);
      });

      it('removes the specified reducer and its associated test', () => {
        expect(fileExists('src/shared/reducers/testReducer.js')).toEqual(true);
        expect(fileExists('src/shared/reducers/__tests__/testReducer.test.js')).toEqual(true);
        destroy(context, 'reducer', 'testReducer', { entryPoint: 'shared' });
        expect(fileExists('src/shared/reducers/testReducer.js')).toEqual(false);
        expect(fileExists('src/shared/reducers/__tests__/testReducer.test.js')).toEqual(false);
      });

      it.skip('it removes reducer from reducers/index.js when removing a specified reducer', () => {
        // @TODO needs implementation
      });

      it('removes the specified container and its associated test', () => {
        expect(fileExists('src/shared/containers/TestContainer.js')).toEqual(true);
        expect(fileExists('src/shared/containers/__tests__/TestContainer.test.js')).toEqual(true);
        destroy(context, 'container', 'TestContainer', { entryPoint: 'shared' });
        expect(fileExists('src/shared/containers/TestContainer.js')).toEqual(false);
        expect(fileExists('src/shared/containers/__tests__/TestContainer.test.js')).toEqual(false);
      });
    });
  });

  describe('when sub-directories are provided', () => {
    beforeEach(() => {
      createDirectories(tmpDir, path.join('shared', 'components', 'mydirectory'));
      const componentPath = path.join(tmpDir, 'src/shared/components/mydirectory/TestComponent.js');
      const componentTestPath = path.join(tmpDir, 'src/shared/components/mydirectory/__tests__/TestComponent.test.js');
      createFiles(componentPath, componentTestPath);
    });

    it('removes the files under the directory', () => {
      expect(fileExists('src/shared/components/mydirectory/TestComponent.js')).toEqual(true);
      expect(fileExists('src/shared/components/mydirectory/__tests__/TestComponent.test.js')).toEqual(true);
      destroy(context, 'component', 'mydirectory/TestComponent', { entryPoint: 'shared' });
      expect(logger.error).not.toHaveBeenCalled();
      expect(fileExists('src/shared/components/mydirectory/TestComponent.js')).toEqual(false);
      expect(fileExists('src/shared/components/mydirectory/__tests__/TestComponent.test.js')).toEqual(false);
    });
  });

  /**
   * @ TODO we need to uncomment the following test when we refactor the other cases about not
   * hitting the disk, see the issue https://github.com/TrueCar/gluestick/issues/483
   */
  // describe('deletes only when entryPoint is valid', () => {
  //   fs.statSync = jest.fn().mockReturnValue(true);
  //   fs.unlinkSync = jest.fn();
  //   beforeEach(() => {
  //     fs.unlinkSync.mockClear();
  //   });
  //
  //   it('destroy the file from apps/main if entryPoint is not specified', () => {
  //     //
  //   });
  //
  //   it('destroy the file if the entryPoint is valid', () => {
  //     destroy(context, 'component', 'TestComponent', { entryPoint: 'shared' });
  //     expect(fs.unlinkSync).toHaveBeenCalled();
  //   });
  //
  //   it('it does not destroy the file if the entryPoint is not valid', () => {
  //     isValidEntryPoint.mockReturnValueOnce(false);
  //     destroy(context, 'component', 'TestComponent', { entryPoint: 'sadas' });
  //     expect(fs.unlinkSync).not.toHaveBeenCalled();
  //   });
  // });
});

