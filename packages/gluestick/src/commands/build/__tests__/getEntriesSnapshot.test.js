jest.mock('../../utils.js');
jest.mock('mkdirp');
jest.mock('fs', () => ({ writeFile: (f, b, o, cb) => { cb(null); } }));
jest.mock('node-fetch');
const handlers = [];
jest.setMock('cross-spawn', ({
  spawn: () => ({ on: (evt, cb) => { handlers.push({ evt, cb }); }, kill: jest.fn() }),
}));

jest.setMock('node-fetch', () => Promise.resolve(
  { text: () => Promise.resolve('body') },
));

const getEntriesSnapshot = require('../getEntiresSnapshots');

const context = require('../../../__tests__/mocks/context');

describe('commands/build/getEntriesSnapshot', () => {
  beforeEach(() => {
    while (handlers.length > 0) {
      handlers.shift();
    }
  });

  it('should prepare static markups', () => {
    const promise = getEntriesSnapshot(context);
    handlers.filter(h => h.evt === 'message')[0].cb({ type: 'test', value: 'Renderer listening' });
    return promise;
  });

  it('should reject promise if spawning renderer fails', () => {
    const promise = getEntriesSnapshot(context);
    handlers.filter(h => h.evt === 'message')[0].cb({ type: 'test', value: '' });
    return promise.catch(error => {
      expect(error).toEqual('Renderer failed to start');
    });
  });

  it('should', () => {
    expect(() => {
      getEntriesSnapshot(context);
      handlers.filter(h => h.evt === 'error')[0].cb(new Error('test error'));
    }).toThrowError('test error');

    expect(() => {
      getEntriesSnapshot(context);
      handlers.filter(h => h.evt === 'exit')[0].cb(1);
    }).toThrowError('Renderer process exited with code 1');
  });
});
