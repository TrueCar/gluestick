/* @flow */

jest.mock('fs');

const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const chalk = require('chalk');

const utils = require('../../utils');

utils.isValidEntryPoint = jest.fn();

const destroy = require('../destroy');

const mockedCommandApi = require('../../__tests__/mocks/context').commandApi;

const errorLogger = jest.fn();
const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
    error: errorLogger,
  }),
};

function createFiles(...filePaths) {
  filePaths.forEach(pathToFile => {
    fs.closeSync(fs.openSync(pathToFile, 'w'));
  });
}

describe('command/destroy', () => {
  const rootDir = path.resolve();
  const fileExists = filePath => fs.existsSync(path.join(rootDir, filePath));
  // $FlowFixMe
  utils.isValidEntryPoint.mockReturnValue(true);

  beforeEach(() => {
    errorLogger.mockClear();
  });

  describe('when files are generated without sub-directories', () => {
    beforeEach(() => {
      const componentPath = path.join(
        rootDir,
        'src/shared/components/TestComponent.js',
      );
      const componentTestPath = path.join(
        rootDir,
        'src/shared/components/__tests__/TestComponent.test.js',
      );
      const containerPath = path.join(
        rootDir,
        'src/shared/containers/TestContainer.js',
      );
      const containerTestPath = path.join(
        rootDir,
        'src/shared/containers/__tests__/TestContainer.test.js',
      );
      const reducerPath = path.join(
        rootDir,
        'src/shared/reducers/testReducer.js',
      );
      const reducerTestPath = path.join(
        rootDir,
        'src/shared/reducers/__tests__/testReducer.test.js',
      );
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
        destroy(commandApi, ['blah', '', { entrypoint: 'shared' }]);
        expect(errorLogger).toBeCalledWith(
          `${chalk.bold('blah')} is not a valid destroy command.`,
        );
      });

      it('reports an error when a name only consists of whitespace', () => {
        destroy(commandApi, ['component', ' ', { entrypoint: 'shared' }]);
        expect(errorLogger).toBeCalledWith(
          `${chalk.bold(' ')} is not a valid name.`,
        );
      });

      it('reports an error when the specified name does not exist', () => {
        destroy(commandApi, [
          'component',
          'somethingthatdoesnotexist',
          { entrypoint: 'shared' },
        ]);
        expect(errorLogger.mock.calls[0][0]).toContain('does not exist');
      });

      it('should ask whether to continue if the name does not match (case sensitive)', async () => {
        inquirer.prompt = jest
          .fn()
          .mockImplementation(() => Promise.resolve({ confirm: true }));
        await destroy(commandApi, [
          'component',
          'testComponent',
          { entrypoint: 'shared' },
        ]);
        expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      });
    });

    describe('when removing files', () => {
      it('removes the specified component and its associated test', () => {
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(
          true,
        );
        expect(
          fileExists('src/shared/components/__tests__/TestComponent.test.js'),
        ).toEqual(true);
        destroy(commandApi, [
          'component',
          'TestComponent',
          { entrypoint: 'shared' },
        ]);
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(
          false,
        );
        expect(
          fileExists('src/shared/components/__tests__/TestComponent.test.js'),
        ).toEqual(false);
      });

      it('removes the specified component and its associated test unsing app option', () => {
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(
          true,
        );
        expect(
          fileExists('src/shared/components/__tests__/TestComponent.test.js'),
        ).toEqual(true);
        destroy(commandApi, ['component', 'TestComponent', { app: 'shared' }]);
        expect(fileExists('src/shared/components/TestComponent.js')).toEqual(
          false,
        );
        expect(
          fileExists('src/shared/components/__tests__/TestComponent.test.js'),
        ).toEqual(false);
      });

      it('removes the specified reducer and its associated test', () => {
        expect(fileExists('src/shared/reducers/testReducer.js')).toEqual(true);
        expect(
          fileExists('src/shared/reducers/__tests__/testReducer.test.js'),
        ).toEqual(true);
        destroy(commandApi, [
          'reducer',
          'testReducer',
          { entrypoint: 'shared' },
        ]);
        expect(fileExists('src/shared/reducers/testReducer.js')).toEqual(false);
        expect(
          fileExists('src/shared/reducers/__tests__/testReducer.test.js'),
        ).toEqual(false);
      });

      it('it removes reducer from reducers/index.js when removing a specified reducer', () => {
        const reducerIndexBefore =
          '/* @flow */\n' +
          'import testReducer from "./testReducer";\n' +
          '\n' +
          'export default {\n' +
          '  testReducer,\n' +
          '};\n';
        const reducerIndexAfter =
          '/* @flow */\n' + '\n' + 'export default {\n' + '};\n';
        const reducersIndexPath = path.join(
          rootDir,
          'src/shared/reducers/index.js',
        );
        fs.writeFileSync(reducersIndexPath, reducerIndexBefore);
        destroy(commandApi, [
          'reducer',
          'testReducer',
          { entrypoint: 'shared' },
        ]);
        expect(fs.readFileSync(reducersIndexPath)).toEqual(reducerIndexAfter);
      });

      it('removes the specified container and its associated test', () => {
        expect(fileExists('src/shared/containers/TestContainer.js')).toEqual(
          true,
        );
        expect(
          fileExists('src/shared/containers/__tests__/TestContainer.test.js'),
        ).toEqual(true);
        destroy(commandApi, [
          'container',
          'TestContainer',
          { entrypoint: 'shared' },
        ]);
        expect(fileExists('src/shared/containers/TestContainer.js')).toEqual(
          false,
        );
        expect(
          fileExists('src/shared/containers/__tests__/TestContainer.test.js'),
        ).toEqual(false);
      });
    });
  });

  describe('when sub-directories are provided', () => {
    beforeEach(() => {
      const componentPath = path.join(
        rootDir,
        'src/shared/components/dir/TestComponent.js',
      );
      const componentTestPath = path.join(
        rootDir,
        'src/shared/components/dir/__tests__/TestComponent.test.js',
      );
      createFiles(componentPath, componentTestPath);
    });

    it('removes the files under the directory', () => {
      expect(fileExists('src/shared/components/dir/TestComponent.js')).toEqual(
        true,
      );
      expect(
        fileExists('src/shared/components/dir/__tests__/TestComponent.test.js'),
      ).toEqual(true);
      destroy(commandApi, [
        'component',
        'dir/TestComponent',
        { entrypoint: 'shared' },
      ]);
      expect(errorLogger).not.toHaveBeenCalled();
      expect(fileExists('src/shared/components/dir/TestComponent.js')).toEqual(
        false,
      );
      expect(
        fileExists('src/shared/components/dir/__tests__/TestComponent.test.js'),
      ).toEqual(false);
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
