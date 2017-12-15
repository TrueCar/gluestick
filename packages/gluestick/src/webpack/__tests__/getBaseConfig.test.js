/* @flow */

jest.mock('../utils/buildClientEntrypoints.js');
jest.mock('../utils/buildServerEntrypoints.js');
jest.mock('../utils/getAliasesForApps.js');

const getBaseConfig = require('../getBaseConfig');
const buildClientEntrypoints = require('../utils/buildClientEntrypoints');
const buildServerEntrypoints = require('../utils/buildServerEntrypoints');

const loggerMock = require('../../__tests__/mocks/context').commandApi.getLogger();

describe('webpack/getBaseConfig', () => {
  it('should create configs abd build entrypoints', () => {
    // $FlowIgnore
    buildClientEntrypoints.mockImplementationOnce(() => ({
      main: 'main.js',
    }));
    // $FlowIgnore
    buildServerEntrypoints.mockClear();

    const { client, server } = getBaseConfig(
      {
        entries: {},
        noProgress: false,
        clientPlugins: [],
        serverPlugins: [],
        skipClientEntryGeneration: false,
        skipServerEntryGeneration: false,
      },
      { logger: loggerMock },
    );

    expect(client).toBeDefined();
    expect(server).toBeDefined();
    expect(buildClientEntrypoints).toHaveBeenCalled();
    expect(buildServerEntrypoints).toHaveBeenCalled();
  });

  it('should create configs without building entrypoints', () => {
    // $FlowIgnore
    buildClientEntrypoints.mockClear();
    // $FlowIgnore
    buildServerEntrypoints.mockClear();

    const { client, server } = getBaseConfig(
      {
        entries: {},
        noProgress: false,
        clientPlugins: [],
        serverPlugins: [],
        skipClientEntryGeneration: true,
        skipServerEntryGeneration: true,
      },
      { logger: loggerMock },
    );

    expect(client).toBeDefined();
    expect(server).toBeDefined();
    expect(buildClientEntrypoints).not.toHaveBeenCalled();
    expect(buildServerEntrypoints).not.toHaveBeenCalled();
  });
});
