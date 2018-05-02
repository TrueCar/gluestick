/* @flow */
import traverse from 'traverse';

jest.mock('../../utils', () => ({ requireModule: v => require(v) }));
jest.mock('../webpack/buildEntries.js', () => () => ({}));
jest.mock('../webpack/buildServerEntries.js', () => jest.fn());
jest.mock('../webpack/prepareEntries.js', () => jest.fn());
jest.mock('../webpack/getAliasesForApps.js', () => () => ({}));
jest.mock(
  'src/webpack.hooks.js',
  () => ({
    webpackClientConfig: config => Object.assign(config, { mutated: true }),
    webpackServerConfig: config => Object.assign(config, { mutated: true }),
  }),
  { virtual: true },
);
jest.mock('src/config/application.js', () => ({}), { virtual: true });
const compileWebpackConfig = require('../compileWebpackConfig');
const gluestickConfig = require('../defaults/glueStickConfig');

// may want to move this to a central place
const mockLogger = () => ({
  warn: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  pretty: false,
  clear: jest.fn(),
  log: jest.fn(),
  print: jest.fn(),
  printCommandInfo: jest.fn(),
  fatal: jest.fn(),
  resetLine: jest.fn(),
});

const replacePaths = obj => {
  traverse(obj).forEach(function search(value) {
    if (typeof value === 'string') {
      this.update(value.replace(process.cwd(), '/project'));
    }
  });
  return obj;
};

describe('config/compileWebpackConfig', () => {
  let logger;
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    logger = mockLogger();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in dev environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('returns the correct client config', () => {
      expect(
        replacePaths(compileWebpackConfig(logger, [], gluestickConfig).client),
      ).toMatchSnapshot();
    });

    it('returns the correct server config', () => {
      expect(
        replacePaths(compileWebpackConfig(logger, [], gluestickConfig).server),
      ).toMatchSnapshot();
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('returns the correct client config', () => {
      expect(
        replacePaths(compileWebpackConfig(logger, [], gluestickConfig).client),
      ).toMatchSnapshot();
    });

    it('returns the correct server config', () => {
      expect(
        replacePaths(compileWebpackConfig(logger, [], gluestickConfig).server),
      ).toMatchSnapshot();
    });
  });
});
