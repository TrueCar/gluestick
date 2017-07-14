/* @flow */
jest.mock('fs');
const spawnMock = jest.fn();
jest.mock('jest', () => ({ run: jest.fn() }));
jest.setMock('cross-spawn', { spawn: { sync: spawnMock } });
jest.mock('cwd/empty/package.json', () => ({}), { virtual: true });
jest.mock(
  'cwd/custom/package.json',
  () => ({
    jest: {
      roots: ['customRoot'],
      verbose: true,
      moduleNameMapper: {
        html: 'html-mapper',
      },
      globals: {
        __DEV__: true,
      },
    },
  }),
  { virtual: true },
);
jest.mock(
  'cwd/custom2/package.json',
  () => ({
    jest: {},
  }),
  { virtual: true },
);

const commandApi = require('../../../__tests__/mocks/context').commandApi;
const testCommand = require('../test');
const jestMock = require('jest');
const path = require('path');
const fs = require('fs');

const infoLogger = jest.fn();
const getMockedCommandApi = (aliases, rules) => {
  return {
    ...commandApi,
    getContextConfig: () => ({
      webpackConfig: {
        client: {
          resolve: {
            alias: aliases,
          },
          module: {
            rules,
          },
        },
      },
    }),
    getLogger: () => ({
      ...commandApi.getLogger(),
      info: infoLogger,
    }),
  };
};

const originalPathJoin = path.join.bind(path);

describe('commands/test/test', () => {
  beforeEach(() => {
    spawnMock.mockClear();
    jestMock.run.mockClear();
  });

  describe('in debug mode', () => {
    it('should spawn degugger', () => {
      path.join = () => 'cwd/empty/package.json';
      testCommand(
        getMockedCommandApi({}, [
          { test: /\.js$/ },
          { test: /\.scss$/ },
          { test: /\.css$/ },
          { test: /\.woff$/ },
          { test: /\.png$/ },
          { test: /\.ttf$/ },
        ]),
        [
          {
            debugTest: true,
            parent: {
              rawArgs: ['', '', '', '--debug-test'],
            },
          },
        ],
      );
      path.join = originalPathJoin;
      expect(spawnMock.mock.calls.length).toBe(1);
      expect(spawnMock.mock.calls[0][1].indexOf('--inspect')).toBeGreaterThan(
        -1,
      );
      expect(spawnMock.mock.calls[0][1].indexOf('--debug-brk')).toBeGreaterThan(
        -1,
      );
      expect(spawnMock.mock.calls[0][1].indexOf('--env')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--config')).toBeGreaterThan(
        -1,
      );
      expect(spawnMock.mock.calls[0][1].indexOf('-i')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][1].indexOf('--watch')).toBeGreaterThan(-1);
      expect(spawnMock.mock.calls[0][0]).toEqual('node');
      expect(spawnMock.mock.calls[0][2]).toEqual({
        stdio: 'inherit',
      });
    });

    it('should notify about default Jest params', () => {
      infoLogger.mockClear();
      path.join = () => 'cwd/empty/package.json';
      testCommand(
        getMockedCommandApi({}, [
          { test: /\.js$/ },
          { test: /\.scss$/ },
          { test: /\.css$/ },
          { test: /\.woff$/ },
          { test: /\.png$/ },
          { test: /\.ttf$/ },
        ]),
        [
          {
            debugTest: true,
            parent: {
              rawArgs: ['', '', '', '--debug-test', '-i'],
            },
          },
        ],
      );
      path.join = originalPathJoin;
      expect(infoLogger.mock.calls[0]).toEqual([
        "Option '-i' is always set by default in debug mode",
      ]);
    });
  });

  describe('in non-debug mode', () => {
    it('should run jest directly with default config', () => {
      path.join = () => 'cwd/empty/package.json';
      testCommand(
        getMockedCommandApi(
          {
            alias1: 'path/to/alias1',
            alias2: 'path/to/alias2',
          },
          [
            { test: /\.js$/ },
            { test: /\.scss$/ },
            { test: /\.css$/ },
            { test: /\.woff$/ },
            { test: /\.png$/ },
            { test: /\.ttf$/ },
          ],
        ),
        [
          {
            debugTest: false,
            parent: {
              rawArgs: ['', '', ''],
            },
          },
        ],
      );
      path.join = originalPathJoin;
      expect(jestMock.run.mock.calls.length).toBe(1);
      const jestConfig = JSON.parse(jestMock.run.mock.calls[0][0][1]);
      expect(jestMock.run.mock.calls[0][0].indexOf('--config')).toBeGreaterThan(
        -1,
      );
      Object.keys(jestConfig.moduleNameMapper).forEach(mapper => {
        expect(
          ['woff', 'css', 'alias1', 'alias2'].find(alias =>
            mapper.includes(alias),
          ),
        ).not.toBeUndefined();
      });
      expect(jestConfig.roots).toEqual(['src']);
    });

    it('should run jest directly with merged default and custom config', () => {
      path.join = () => 'cwd/custom/package.json';
      fs.existsSync = jest.fn(() => true);
      testCommand(
        getMockedCommandApi(
          {
            alias1: 'path/to/alias1',
            alias2: 'path/to/alias2',
          },
          [
            { test: /\.js$/ },
            { test: /\.scss$/ },
            { test: /\.css$/ },
            { test: /\.woff$/ },
            { test: /\.png$/ },
            { test: /\.ttf$/ },
          ],
        ),
        [
          {
            debugTest: false,
            parent: {
              rawArgs: ['', '', ''],
            },
          },
        ],
      );
      path.join = originalPathJoin;
      expect(jestMock.run.mock.calls.length).toBe(1);
      const jestConfig = JSON.parse(jestMock.run.mock.calls[0][0][1]);
      expect(jestMock.run.mock.calls[0][0].indexOf('--config')).toBeGreaterThan(
        -1,
      );

      // Precedence before aliases
      const moduleMapperKeys = Object.keys(jestConfig.moduleNameMapper);
      expect(moduleMapperKeys[0]).toEqual(
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$',
      );
      expect(moduleMapperKeys[1]).toEqual('\\.(css|scss|sass|less)$');
      expect(moduleMapperKeys[2]).toEqual('html');
      expect(moduleMapperKeys[3]).toEqual('^alias1(.*)$');
      expect(moduleMapperKeys[4]).toEqual('^alias2(.*)$');
      expect(moduleMapperKeys.length).toBe(5);

      expect(jestConfig.roots).toEqual(['src', 'test', 'customRoot']);
      expect(jestConfig.verbose).toBeTruthy();

      expect(Object.keys(jestConfig.globals).length).toBe(1);
      expect(jestConfig.globals.__DEV__).toBe(true);
    });

    it('should run jest directly with merged default and custom config (no custom moduleNameMapper)', () => {
      path.join = () => 'cwd/empty/package.json';
      fs.existsSync = jest.fn(() => true);
      testCommand(
        getMockedCommandApi(
          {
            alias1: 'path/to/alias1',
            alias2: 'path/to/alias2',
          },
          [
            { test: /\.js$/ },
            { test: /\.scss$/ },
            { test: /\.css$/ },
            { test: /\.woff$/ },
            { test: /\.png$/ },
            { test: /\.ttf$/ },
          ],
        ),
        [
          {
            debugTest: false,
            parent: {
              rawArgs: ['', '', ''],
            },
          },
        ],
      );
      path.join = originalPathJoin;
      const jestConfig = JSON.parse(jestMock.run.mock.calls[0][0][1]);

      const moduleMapperKeys = Object.keys(jestConfig.moduleNameMapper);
      console.log(moduleMapperKeys);
      expect(moduleMapperKeys[2]).toEqual('^alias1(.*)$');
      expect(moduleMapperKeys[3]).toEqual('^alias2(.*)$');
      expect(moduleMapperKeys.length).toBe(4);
    });
  });
});
