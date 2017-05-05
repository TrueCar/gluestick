/* @flow */

jest.mock('../../../config/webpack/progressHandler');
jest.mock('../../utils.js');
jest.mock('../getEntiresSnapshots');
jest.mock('../compile.js', () => jest.fn(() => Promise.resolve()));

const compile = require('../compile');
const getEntiresSnapshots = require('../getEntiresSnapshots');
const utils = require('../../utils');
const build = require('../build');

const context = require('../../../__tests__/mocks/context');

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
    build(context, { client: false, server: false });
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
    build(context, { client: true, server: true });
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
    build(context, { client: true });
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('client');
    expect(compile).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('client');
  });

  it('should build server', () => {
    build(context, { server: true });
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(utils.clearBuildDirectory.mock.calls[0][1]).toEqual('server');
    expect(compile).toHaveBeenCalledTimes(1);
    // $FlowIgnore donesn't know about jest mock
    expect(compile.mock.calls[0][2]).toEqual('server');
  });

  it('should build client, server and static markup', (done) => {
    build(context, { client: false, server: false, static: true });
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
    expect(() => {
      build(context, { client: false, server: true, static: true });
    }).toThrowError('--static options must be used with both client and server build');
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(0);
    expect(compile).toHaveBeenCalledTimes(0);
  });

  it('should fail to build if static was passed, but server won\'t be build', () => {
    expect(() => {
      build(context, { client: true, server: false, static: true });
    }).toThrowError('--static options must be used with both client and server build');
    expect(utils.clearBuildDirectory).toHaveBeenCalledTimes(0);
    expect(compile).toHaveBeenCalledTimes(0);
  });
});
