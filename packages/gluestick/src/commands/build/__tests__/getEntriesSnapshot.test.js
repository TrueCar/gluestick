jest.mock('../../utils.js');
jest.mock('mkdirp');
jest.mock('fs');
jest.mock('cross-spawn');
jest.mock('../../../webpack/utils/prepareEntries', () => () => ({
  '/': '',
  '/test-0': '',
  '/test-1': '',
}))

jest.mock('node-fetch', () => () =>  Promise.resolve({ text: () => Promise.resolve('body') }));

const fs = require('fs');
const crossSpawn = require('cross-spawn');
const path = require('path');
const getEntriesSnapshot = require('../getEntiresSnapshots');

const { cliContext } = require('../../../__tests__/mocks/context');
const getMockedCliContext = (customLogger) => ({
  ...cliContext,
  logger: {
    ...cliContext.logger,
    ...customLogger,
  },
});

describe('commands/build/getEntriesSnapshot', () => {
  it('should prepare static markups', () => {
    const callbacks = [];
    crossSpawn.spawn.mockImplementationOnce(() => {
      return {
        kill() {},
        on(event, callback) {
          callbacks.push({ event, callback });
          callbacks
            .filter(({ event }) => event === 'message')
            .forEach(({ callback }) => callback({ type: 'SUCCESS', value: 'Renderer listening' }));
        },
      };
    });
    return getEntriesSnapshot(getMockedCliContext()).then(() => {
      const getPath = name => path.join(
        process.cwd(),
        cliContext.config.GSConfig.buildStaticPath,
        `${name}.html`
      );
      expect(fs.existsSync(getPath('main'))).toBeTruthy();
      expect(fs.existsSync(getPath('test-0'))).toBeTruthy();
      expect(fs.existsSync(getPath('test-1'))).toBeTruthy();
    });
  });

  it('should reject promise if spawning renderer fails', (done) => {
    const fatalLogger = jest.fn((error) => {
      expect(error).toEqual('Renderer failed to start');
      done();
    });
    const callbacks = [];
    crossSpawn.spawn.mockImplementationOnce(() => {
      return {
        kill() {},
        on(event, callback) {
          callbacks.push({ event, callback });
          callbacks
            .filter(({ event }) => event === 'message')
            .forEach(({ callback }) => callback({ type: 'ERROR', value: '' }));
        },
      };
    });
    const promise = getEntriesSnapshot(getMockedCliContext({ fatal: fatalLogger }));
  });

  it('should reject if there is a problem running renderer', (done) => {
    const fatalLogger = jest.fn((error) => {
      expect(error).toEqual(new Error('test error'));
      done();
    });
    const callbacks = [];
    crossSpawn.spawn.mockImplementationOnce(() => {
      return {
        kill() {},
        on(event, callback) {
          callbacks.push({ event, callback });
          callbacks
            .filter(({ event }) => event === 'error')
            .forEach(({ callback }) => callback('test error'));
        },
      };
    });
    const promise = getEntriesSnapshot(getMockedCliContext({ fatal: fatalLogger }));
  });

  it('should reject if renderer exited with non-zero code', (done) => {
    const fatalLogger = jest.fn((error) => {
      expect(error).toEqual(new Error('Renderer process exited with code 1'));
      done();
    });
    const callbacks = [];
    crossSpawn.spawn.mockImplementationOnce(() => {
      return {
        kill() {},
        on(event, callback) {
          callbacks.push({ event, callback });
          callbacks
            .filter(({ event }) => event === 'exit')
            .forEach(({ callback }) => callback(1));
        },
      };
    });
    const promise = getEntriesSnapshot(getMockedCliContext({ fatal: fatalLogger }));
  });
});
