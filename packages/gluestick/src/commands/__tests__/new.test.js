jest.mock('cross-spawn');
jest.mock('gluestick-generators');

const newApp = require('../new');
const spawn = require('cross-spawn');
const generate = require('gluestick-generators').default;

const { highlight, filename } = require('../../cli/colorScheme');
const packageJSON = require('../../../package.json');

describe('cli: gluestick new', () => {
  const errorLogger = jest.fn();
  const infoLogger = jest.fn();
  const successLogger = jest.fn();

  const mockedCommandApi = require('../../__tests__/mocks/context').commandApi;

  const commandApi = {
    ...mockedCommandApi,
    getLogger: () => ({
      ...mockedCommandApi.getLogger(),
      error: errorLogger,
      info: infoLogger,
      success: successLogger,
    }),
  };

  const validProjectName = 'gsTestApp';
  const cloneProcessCwd = process.cwd.bind({});

  beforeEach(() => {
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.cwd = cloneProcessCwd.bind({});
    jest.resetAllMocks();
  });

  it('should logs that project is being generated', () => {
    newApp(commandApi, [validProjectName]);
    expect(infoLogger.mock.calls[0][0]).toEqual(
      `${filename(validProjectName)} is being generated...`,
    );
  });

  it('should not generate a project if gluestick dependency is missing in package.json', () => {
    newApp(
      {
        ...commandApi,
        isGluestickProject: () => false,
      },
      [validProjectName],
    );
    expect(generate).not.toBeCalled();
  });

  it('call generate with the correct arguments', () => {
    newApp(commandApi, [validProjectName]);
    expect(generate.mock.calls[0][0]).toEqual({
      entityName: validProjectName,
      generatorName: 'new',
      options: {
        appName: validProjectName,
        dev: null,
      },
    });
  });

  it('calls spawn.sync install flow-typed definitions', () => {
    newApp(commandApi, [validProjectName]);

    expect(spawn.sync).toBeCalledWith(
      './node_modules/.bin/flow-typed',
      ['install', `jest@${packageJSON.dependencies.jest}`],
      { stdio: 'inherit' },
    );
  });

  it('logs a successful message if everything ran correctly', () => {
    newApp(commandApi, [validProjectName]);

    expect(infoLogger).toHaveBeenCalledTimes(2);

    const newAppPath = filename(process.cwd());

    expect(successLogger.mock.calls[0][0]).toContain(
      `${highlight('New GlueStick project created')} at ${newAppPath}`,
    );
    expect(infoLogger.mock.calls[1][0]).toEqual(
      'To run your app and start developing\n' +
        `         -> cd ${validProjectName}\n` +
        '         -> gluestick start\n' +
        '         -> Point the browser to http://localhost:8888',
    );
  });
});
