/* @flow */
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn((file) => file.includes('0')),
  readFileSync: jest.fn(val => val),
}));
jest.mock('mkdirp', () => ({ sync: jest.fn() }));
jest.mock('file-0', () => '', { virtual: true });
jest.mock('file-1', () => '', { virtual: true });
jest.mock('../checkForMismatch.js', () => jest.fn(
  (a, dev) => Promise.resolve({ shouldFix: dev }),
));
jest.mock('../getSingleEntryFromGenerator.js', () => jest.fn());
jest.mock('gluestick-generators', () => ({
  parseConfig: jest.fn(
    () => ({
      entry: { template: 'file-0' },
    }),
  ),
}));
jest.mock('../checkForMismatch.js', () => jest.fn(() => Promise.resolve({ shouldFix: false })));
const fs = require('fs');
const path = require('path');
const autoUpgrade = require('../autoUpgrade');
const checkForMismatch = require('../checkForMismatch');

const originalPathJoin = path.join.bind(path);
const getContext = (config) => ({
  logger: {
    success: jest.fn(),
  },
  config: {
    GSConfig: {
      autoUpgrade: config,
    },
  },
});

describe('autoUpgrade/index', () => {
  beforeEach(() => {
    fs.writeFileSync.mockClear();
    fs.existsSync.mockClear();
    fs.readFileSync.mockClear();
    // $FlowIgnore checkForMismatch is mocked
    checkForMismatch.mockClear();
  });

  afterAll(() => {
    jest.resetAllMocks();
    path.join = originalPathJoin;
  });

  it('should not detect any changes', async () => {
    path.join = jest.fn(() => 'file-0');
    // $FlowIgnore
    await autoUpgrade(getContext({
      changed: ['file-0'],
      added: ['file-0'],
    }));
    expect(fs.existsSync.mock.calls[0][0]).toEqual('file-0');
    expect(fs.writeFileSync.mock.calls.length).toBe(0);
  });

  it('should update files', async () => {
    path.join = jest.fn(() => 'file-1');
    await autoUpgrade(getContext({
      changed: ['file-1'],
      added: ['file-1'],
    }));
    expect(fs.existsSync.mock.calls[0][0]).toEqual('file-1');
    expect(fs.writeFileSync.mock.calls).toEqual([
      ['file-1', 'file-0', 'utf-8'],
      ['file-1', 'file-0', 'utf-8'],
    ]);
  });

  it('should update dependencies', async () => {
    path.join = jest.fn(() => 'file-1');
    await autoUpgrade(getContext({
      changed: [],
      added: [],
    }));
    // $FlowIgnore updateDependencies is mocked
    expect(checkForMismatch.mock.calls.length).toBe(1);
  });
});
