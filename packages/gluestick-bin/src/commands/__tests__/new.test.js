import path from 'path';
import newApp from '../new';

jest.mock('cross-spawn');
jest.mock('gluestick-generators');

const spawn = require('cross-spawn');
const generate = require('gluestick-generators').default;

const { highlight, filename } = require('../../cli/colorScheme');
const packageJSON = require('../../../package.json');

const mockPackageJson = (mockPath) => {
  jest.doMock(mockPath, () => {
    if (mockPath.includes('validPackage')) {
      return {
        dependencies: {
          gluestick: '*',
        },
      };
    }
    if (mockPath.includes('noGluestick')) {
      return {
        dependencies: {},
      };
    }
    return {};
  }, { virtual: true });
};

mockPackageJson(path.join(__dirname, 'new', 'validPackage', 'package.json'));
mockPackageJson(path.join(__dirname, 'new', 'noGluestick', 'package.json'));
mockPackageJson(path.join(__dirname, 'new', 'noDependencies', 'package.json'));

describe('cli: gluestick new', () => {
  const logger = jest.fn();
  logger.error = jest.fn();
  logger.info = jest.fn();
  logger.success = jest.fn();

  const context = { logger };
  const validProjectName = 'gsTestApp';
  const cloneProcessCwd = process.cwd.bind({});

  beforeEach(() => {
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.cwd = cloneProcessCwd.bind({});
    jest.resetAllMocks();
  });

  const mockProcessCwdCallOnce = () => {
    let counter = 0;
    process.cwd = jest.fn().mockImplementation(() => {
      return counter++ === 0 ? path.join(__dirname, 'new', 'validPackage') : cloneProcessCwd();
    });
  };

  it('should logs that project is being generated', () => {
    process.cwd = jest.fn().mockReturnValueOnce(path.join(__dirname, 'new', 'validPackage'));
    newApp(context, validProjectName);
    expect(logger.info.mock.calls[0][0]).toEqual(`${filename(validProjectName)} is being generated...`);
  });

  it('should not generate a project if there are no dependencies in package.json', () => {
    process.cwd = jest.fn().mockReturnValueOnce(path.join(__dirname, 'new', 'noDependencies'));
    newApp(context, validProjectName);
    expect(generate).not.toBeCalled();
  });

  it('should not generate a project if there is no gluestick in package.json', () => {
    process.cwd = jest.fn().mockReturnValueOnce(path.join(__dirname, 'new', 'noGluestick'));
    newApp(context, validProjectName);
    expect(generate).not.toBeCalled();
  });

  it('should not generate a project if the path to package.json is wrong', () => {
    process.cwd = jest.fn().mockReturnValueOnce(path.join(__dirname, 'bad(#939jjasda)A0dsa0asdPath'));
    newApp(context, validProjectName);
    expect(generate).not.toBeCalled();
  });

  it('call generate with the correct arguments', () => {
    mockProcessCwdCallOnce();
    newApp(context, validProjectName);
    expect(generate).toBeCalledWith({
      entityName: validProjectName,
      generatorName: 'new',
      options: {
        appName: validProjectName,
        dev: null,
      },
    }, logger);
  });

  it('calls spawn.sync install flow-typed definitions', () => {
    mockProcessCwdCallOnce();
    newApp(context, validProjectName);

    expect(spawn.sync).toBeCalledWith(
      './node_modules/.bin/flow-typed',
      ['install', `jest@${packageJSON.dependencies.jest}`],
      { stdio: 'inherit' },
    );
  });

  it('logs a successful message if everything ran correctly', () => {
    mockProcessCwdCallOnce();
    newApp(context, validProjectName);

    expect(logger.info).toHaveBeenCalledTimes(6);

    const newAppPath = filename(process.cwd());

    expect(logger.info.mock.calls[1][0]).toContain(
      `${highlight('New GlueStick project created')} at ${newAppPath}`,
    );
    expect(logger.info.mock.calls[2][0]).toEqual('To run your app and start developing');
    expect(logger.info.mock.calls[3][0]).toEqual(`    cd ${validProjectName}`);
    expect(logger.info.mock.calls[4][0]).toEqual('    gluestick start');
    expect(logger.info.mock.calls[5][0]).toEqual('    Point the browser to http://localhost:8888');
  });
});
