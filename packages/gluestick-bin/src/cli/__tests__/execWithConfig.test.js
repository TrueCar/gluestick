jest.mock('../../plugins/prepareConfigPlugins.js');
jest.mock('../../config/compileGlueStickConfig.js', () => () => ({}));
jest.mock('../../config/compileWebpackConfig.js');
const errorFn = jest.fn();
jest.setMock('../logger.js', (arg) => ({
  error: errorFn,
  level: arg,
}));
jest.mock('ok/package.json', () => ({
  dependencies: {
    gluestick: 'gluestick',
  },
  gluestick: {},
}), { virtual: true });
jest.mock('fail/package.json', () => ({
  dependencies: {},
}), { virtual: true });

const execWithConfig = require('../execWithConfig');

describe('cli/execWithConfig', () => {
  beforeEach(() => {
    errorFn.mockClear();
  });

  it('should throw error if command is not in gs project', () => {
    const originalProcessExit = process.exit.bind(process);
    const originalProcessCwd = process.cwd.bind(process);
    process.exit = jest.fn();
    process.cwd = () => 'fail';
    execWithConfig(() => {}, [{}], {}, {});
    expect(errorFn.mock.calls[0])
      .toEqual(['Command need to be run in gluestick project.']);
    expect(process.exit.mock.calls[0]).toEqual([1]);
    process.cwd = originalProcessCwd;
    process.exit = originalProcessExit;
  });

  it('should throw error if package was not found', () => {
    const originalProcessExit = process.exit.bind(process);
    const originalProcessCwd = process.cwd.bind(process);
    process.exit = jest.fn();
    process.cwd = () => 'not-found';
    execWithConfig(() => {}, [{}], {}, {});
    expect(errorFn.mock.calls[0])
      .toEqual(['Cannot find module \'not-found/package.json\' from \'execWithConfig.js\'']);
    expect(process.exit.mock.calls[0]).toEqual([1]);
    process.cwd = originalProcessCwd;
    process.exit = originalProcessExit;
  });

  it('should exec command and hooks with everything skipped', () => {
    const originalProcessCwd = process.cwd.bind(process);
    process.cwd = () => 'ok';
    const command = jest.fn();
    const cmdArg = { arg1: true, logLevel: 'warn' };
    const hook = jest.fn();
    execWithConfig(command, [cmdArg], {
      skipPlugins: true,
    }, {
      pre: hook,
      post: [hook],
    });
    const context = {
      config: {
        projectConfig: {},
        GSConfig: null,
        webpackConfig: null,
        plugins: [],
      },
      logger: {
        error: errorFn,
        level: 'warn',
      },
    };
    expect(command.mock.calls[0]).toEqual([context, cmdArg]);
    expect(hook.mock.calls[0]).toEqual([context]);
    expect(hook.mock.calls[1]).toEqual([context]);
    process.cwd = originalProcessCwd;
  });

  it('should catch failing command', () => {
    const originalProcessExit = process.exit.bind(process);
    const originalProcessCwd = process.cwd.bind(process);
    const originalStdoutWrite = process.stderr.write.bind(process.stderr);
    process.stderr.write = jest.fn();
    process.exit = jest.fn();
    process.cwd = () => 'ok';
    const command = () => { throw Error('test'); };
    execWithConfig(command, [{}], {
      skipPlugins: true,
    }, {});
    expect(process.stderr.write.mock.calls[0])
      .toEqual(['test']);
    expect(process.exit.mock.calls[0]).toEqual([1]);
    process.cwd = originalProcessCwd;
    process.exit = originalProcessExit;
    process.stderr.write = originalStdoutWrite;
  });


  it('should exec command with GSConfig', () => {
    const originalProcessCwd = process.cwd.bind(process);
    process.cwd = () => 'ok';
    const cmdArg = { logLevel: 'warn' };
    const command = jest.fn();
    execWithConfig(command, [cmdArg], {
      skipPlugins: true,
      useGSConfig: true,
    }, {});
    expect(command.mock.calls[0][0].config.GSConfig.pluginsConfigPath)
      .toEqual('ok/src/gluestick.plugins.js');
    process.cwd = originalProcessCwd;
  });
});
