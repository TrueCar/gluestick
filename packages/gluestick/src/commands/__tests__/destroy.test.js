import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import temp from 'temp';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import destroy from '../destroy';

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

  const logger = jest.fn();
  logger.error = jest.fn();
  logger.info = jest.fn();
  logger.success = jest.fn();

  const context = { logger };

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-destroy');
    process.chdir(tmpDir);

    fs.closeSync(fs.openSync('.gluestick', 'w'));
    createDirectories(tmpDir, 'components', 'reducers', 'containers');
  });

  afterEach((done) => {
    jest.resetAllMocks();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  describe('when files are generated without sub-directories', () => {
    beforeEach(() => {
      const componentPath = path.join(tmpDir, 'src/components/TestComponent.js');
      const componentTestPath = path.join(tmpDir, 'src/components/__tests__/TestComponent.test.js');
      const containerPath = path.join(tmpDir, 'src/containers/TestContainer.js');
      const containerTestPath = path.join(tmpDir, 'src/containers/__tests__/TestContainer.test.js');
      const reducerPath = path.join(tmpDir, 'src/reducers/testReducer.js');
      const reducerTestPath = path.join(tmpDir, 'src/reducers/__tests__/testReducer.test.js');
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
        destroy(context, 'blah', '');
        expect(logger.error).toBeCalledWith(`${chalk.bold('blah')} is not a valid destroy command.`);
      });

      it('reports an error when a name only consists of whitespace', () => {
        destroy(context, 'component', ' ');
        expect(logger.error).toBeCalledWith(`${chalk.bold(' ')} is not a valid name.`);
      });

      it('reports an error when the specified name does not exist', () => {
        destroy(context, 'component', 'somethingthatdoesnotexist');
        expect(logger.error.mock.calls[0][0]).toContain('does not exist');
      });

      it('should ask whether to continue if the name does not match (case sensitive)', async () => {
        inquirer.prompt = jest.fn().mockImplementation(() => Promise.resolve({ confirm: true }));

        await destroy(context, 'component', 'testComponent');
        expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      });
    });

    describe('when removing files', () => {
      it('removes the specified component and its associated test', () => {
        expect(fileExists('src/components/TestComponent.js')).toEqual(true);
        expect(fileExists('src/components/__tests__/TestComponent.test.js')).toEqual(true);
        destroy(context, 'component', 'TestComponent');
        expect(fileExists('src/components/TestComponent.js')).toEqual(false);
        expect(fileExists('src/components/__tests__/TestComponent.test.js')).toEqual(false);
      });

      it('removes the specified reducer and its associated test', () => {
        expect(fileExists('src/reducers/testReducer.js')).toEqual(true);
        expect(fileExists('src/reducers/__tests__/testReducer.test.js')).toEqual(true);
        destroy(context, 'reducer', 'testReducer');
        expect(fileExists('src/reducers/testReducer.js')).toEqual(false);
        expect(fileExists('src/reducers/__tests__/testReducer.test.js')).toEqual(false);
      });

      it.skip('it removes reducer from reducers/index.js when removing a specified reducer', () => {
        // @TODO needs implementation
      });

      it('removes the specified container and its associated test', () => {
        expect(fileExists('src/containers/TestContainer.js')).toEqual(true);
        expect(fileExists('src/containers/__tests__/TestContainer.test.js')).toEqual(true);
        destroy(context, 'container', 'TestContainer');
        expect(fileExists('src/containers/TestContainer.js')).toEqual(false);
        expect(fileExists('src/containers/__tests__/TestContainer.test.js')).toEqual(false);
      });
    });
  });

  describe('when sub-directories are provided', () => {
    beforeEach(() => {
      createDirectories(tmpDir, path.join('components', 'mydirectory'));
      const componentPath = path.join(tmpDir, 'src/components/mydirectory/TestComponent.js');
      const componentTestPath = path.join(tmpDir, 'src/components/mydirectory/__tests__/TestComponent.test.js');
      createFiles(componentPath, componentTestPath);
    });

    it('removes the files under the directory', () => {
      expect(fileExists('src/components/mydirectory/TestComponent.js')).toEqual(true);
      expect(fileExists('src/components/mydirectory/__tests__/TestComponent.test.js')).toEqual(true);
      destroy(context, 'component', 'mydirectory/TestComponent');
      expect(logger.error).not.toHaveBeenCalled();
      expect(fileExists('src/components/mydirectory/TestComponent.js')).toEqual(false);
      expect(fileExists('src/components/mydirectory/__tests__/TestComponent.test.js')).toEqual(false);
    });
  });
});
