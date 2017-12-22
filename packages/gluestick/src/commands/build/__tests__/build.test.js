/* @flow */

jest.mock('../../../webpack/plugins/progressHandler');
jest.mock('../../utils.js');
jest.mock('../getEntiresSnapshots');
jest.mock('../../../webpack/config/vendorDll');
jest.mock('../compile.js', () => jest.fn(() => Promise.resolve()));

const compile = require('../compile');
const getEntiresSnapshots = require('../getEntiresSnapshots');
const utils = require('../../utils');
const build = require('../build');
const vendorDll = require('../../../webpack/config/vendorDll');

const mockedCommandApi = require('../../../__tests__/mocks/context').commandApi;

const fatalLogger = jest.fn();
const commandApi = {
  ...mockedCommandApi,
  getLogger: () => ({
    ...mockedCommandApi.getLogger(),
    fatal: fatalLogger,
  }),
};


const originalProcessExit = process.exit.bind(process);
// $FlowIgnore donesn't like overwriting this
process.exit = jest.fn();

describe('commands/build/build', () => {
  beforeEach(() => {
    // $FlowIgnore donesn't know about jest mock
    utils.clearBuildDirectory.mockClear();
    // $FlowIgnore donesn't know about jest mock
    compile.mockClear();
    // $FlowIgnore donesn't know about jest mock
    getEntiresSnapshots.mockClear();
  });

  afterAll(() => {
    // $FlowIgnore donesn't like overwriting this
    process.exit = originalProcessExit;
  });

  it('should build client and server (no flags)', () => {
    build(commandApi, [{ client: false, server: false }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[1][1]).toEqual('server');
    expect(compile).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[1][2]).toEqual('server');
  });

  it('should build client and server (with flags)', () => {
    build(commandApi, [{ client: true, server: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[1][1]).toEqual('server');
    expect(compile).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[1][2]).toEqual('server');
  });

  it('should build client', () => {
    build(commandApi, [{ client: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    expect(compile).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('client');
  });

  it('should build server', () => {
    build(commandApi, [{ server: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('server');
    expect(compile).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('server');
  });

  it('should build client, server and static markup', (done) => {
    build(commandApi, [{ client: false, server: false, static: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[1][1]).toEqual('server');
    expect(compile).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[1][2]).toEqual('server');
    setTimeout(() => {
      expect(getEntiresSnapshots).toHaveBeenCalledTimes(1);
      done();
    }, 0);
  });

  it('should fail to build if static was passed, but client won\'t be build', () => {
    fatalLogger.mockClear();
    build(commandApi, [{ client: false, server: true, static: true }]);
    expect(fatalLogger)
      .toHaveBeenCalledWith('--static options must be used with both client and server build');
  });

  it('should fail to build if static was passed, but server won\'t be build', () => {
    fatalLogger.mockClear();
    build(commandApi, [{ client: true, server: false, static: true }]);
    expect(fatalLogger)
      .toHaveBeenCalledWith('--static options must be used with both client and server build');
  });

  it('should build vendor bundle only', () => {
    build(commandApi, [{ client: true, server: true, static: true, vendor: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(2);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[1][1]).toEqual('dlls');
    expect(compile).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('vendor');
  });

  it('should build vendor bundle only and bail', () => {
    // $FlowIgnore vendorDll is mocked
    vendorDll.isValid.mockImplementationOnce(() => true);
    build(commandApi, [{ client: false, server: false, vendor: true, skipIfOk: true }]);
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(0);
    expect(compile).toHaveBeenCalledTimes(0);
  });
});
