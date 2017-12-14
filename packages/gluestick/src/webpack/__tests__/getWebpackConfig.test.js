/* @flow */

jest.mock('../getBaseConfig.js', () => () => ({
  client: {
    toObject() {
      return this;
    },
    merge(v) {
      return { ...this, ...v };
    },
  },
  server: {
    toObject() {
      return this;
    },
    merge(v) {
      return { ...this, ...v };
    },
  },
}));
jest.mock('../utils/prepareEntries.js', () => jest.fn());
jest.mock('../../utils', () => ({ requireModule: jest.fn(v => require(v)) }));
jest.mock('../../plugins/readRuntimePlugins.js');
jest.mock('../../plugins/readServerPlugins.js');
jest.mock(
  'src/webpack.config.js',
  () => ({
    client: base => base.merge({ mutated: true }),
    server: base => base.merge({ mutated: true }),
  }),
  { virtual: true },
);

const getWebpackConfig = require('../getWebpackConfig');
const readRuntimePlugins = require('../../plugins/readRuntimePlugins');
const readServerPlugins = require('../../plugins/readServerPlugins');
const prepareEntries = require('../utils/prepareEntries');
const { requireModule } = require('../../utils');

const loggerMock = require('../../__tests__/mocks/context').commandApi.getLogger();

const processCwd = process.cwd.bind(process);

describe('webpack/getWebpackConfig', () => {
  beforeEach(() => {
    process.cwd = () => '';
  });

  afterEach(() => {
    process.cwd = processCwd;
  });

  it('should return webpack config', () => {
    readRuntimePlugins.mockImplementationOnce(() => []);
    readServerPlugins.mockImplementationOnce(() => []);

    const { client, server } = getWebpackConfig(loggerMock, [], {
      skipClientEntryGeneration: false,
      skipServerEntryGeneration: false,
      entryOrGroupToBuild: '/',
      noProgress: false,
    });

    expect(client).not.toBeUndefined();
    expect(client).not.toBeNull();
    expect(server).not.toBeUndefined();
    expect(server).not.toBeNull();
  });

  it('should skip entry generation and plugins reading', () => {
    readRuntimePlugins.mockClear();
    readServerPlugins.mockClear();

    getWebpackConfig(loggerMock, [], {
      skipClientEntryGeneration: true,
      skipServerEntryGeneration: true,
      entryOrGroupToBuild: '/',
      noProgress: false,
    });

    expect(readRuntimePlugins).not.toHaveBeenCalled();
    expect(readServerPlugins).not.toHaveBeenCalled();
  });

  it('should log error and exit if prepareEntries fails', () => {
    prepareEntries.mockImplementationOnce(() => {
      throw new Error('test');
    });
    readRuntimePlugins.mockImplementationOnce(() => []);
    readServerPlugins.mockImplementationOnce(() => []);
    loggerMock.fatal.mockClear();

    getWebpackConfig(loggerMock, [], {
      skipClientEntryGeneration: false,
      skipServerEntryGeneration: false,
      entryOrGroupToBuild: '/',
      noProgress: false,
    });

    expect(loggerMock.fatal).toHaveBeenCalled();
  });

  it('should log error and exit if requireing webpack config hooks fails', () => {
    requireModule.mockImplementationOnce(() => {
      throw new Error('tes');
    });
    readRuntimePlugins.mockImplementationOnce(() => []);
    readServerPlugins.mockImplementationOnce(() => []);
    loggerMock.fatal.mockClear();

    getWebpackConfig(loggerMock, [], {
      skipClientEntryGeneration: false,
      skipServerEntryGeneration: false,
      entryOrGroupToBuild: '/',
      noProgress: false,
    });

    expect(loggerMock.fatal).toHaveBeenCalled();
  });

  it('should mutate configs', () => {
    readRuntimePlugins.mockClear();
    readServerPlugins.mockClear();

    const plugins = [
      {
        client: config => config.merge({ mutatedClientPost: true }),
      },
      {
        server: {
          pre: config => config.merge({ mutatedServerPre: true }),
          post: config => config.merge({ mutatedServerPost: true }),
        },
      },
    ];

    const { client, server } = getWebpackConfig(loggerMock, plugins, {
      skipClientEntryGeneration: true,
      skipServerEntryGeneration: true,
      entryOrGroupToBuild: '/',
      noProgress: false,
    });

    expect(client.mutated).toBeTruthy();
    expect(client.mutatedClientPost).toBeTruthy();
    expect(server.mutated).toBeTruthy();
    expect(server.mutatedServerPre).toBeTruthy();
    expect(server.mutatedServerPost).toBeTruthy();
  });
});
