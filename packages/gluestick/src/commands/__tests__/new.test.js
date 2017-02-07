import temp from 'temp';
import rimraf from 'rimraf';
import inquirer from 'inquirer';
import newCommand from '../new';
import generate from '../../generator';

const cliColorScheme = require('../../cli/colorScheme');

const { highlight, filename } = cliColorScheme;
jest.mock('../../generator');

describe('cli: gluestick new', () => {
  let originalCwd;
  let tmpDir;
  const logger = jest.fn();
  logger.info = jest.fn();
  logger.warn = jest.fn();
  module.parent.createTemplate = jest.fn();

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-new');
    process.chdir(tmpDir);
  });

  afterEach((done) => {
    jest.resetAllMocks();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  // @TODO needs to be fixed
  it.skip('if new app has package.json prompt should be called', async () => {
    inquirer.prompt = jest.fn().mockImplementation(() => Promise.resolve({ confirm: true }));
    newCommand({
      logger,
    });
    const pathToFile = filename(`${process.cwd()}`);
    expect(logger.info.mock.calls[0][0]).toContain(`You are about to initialize a new gluestick project at ${pathToFile}`);
  });

  it('calls generate with correct params', () => {
    newCommand({
      logger,
    }, 'gs-new-test');
    expect(generate).toBeCalledWith({
      generatorName: 'new',
      entityName: 'gs-new-test',
    }, logger);
  });

  it('logs a successful message if everything run correctly', () => {
    newCommand({
      logger,
    }, 'gs-new-test');

    expect(logger.info).toHaveBeenCalledTimes(5);

    const pathToFile = filename(`${process.cwd()}`);

    expect(logger.info.mock.calls[0][0]).toContain(
      `${highlight('New GlueStick project created')} at ${pathToFile}`,
    );
    expect(logger.info.mock.calls[1][0]).toEqual('To run your app and start developing');
    expect(logger.info.mock.calls[2][0]).toEqual('    cd gs-new-test');
    expect(logger.info.mock.calls[3][0]).toEqual('    gluestick start');
    expect(logger.info.mock.calls[4][0]).toEqual('    Point the browser to http://localhost:8888');
  });
});

