jest.mock('default-505.hbs', () => 'default', { virtual: true });
jest.mock('custom-505.hbs', () => 'custom', { virtual: true });
jest.mock('handlebars', () => ({
  registerHelper: jest.fn(),
  compile: jest.fn((template) => () => template),
}));

const errorHandler = require('../errorHandler');
const path = require('path');
const fs = require('fs');

const originalPathJoin = path.join.bind(path);
const originalFsStat = fs.stat.bind(fs);
const originalFsReadFile = fs.stat.bind(fs);

const response = {
  status: jest.fn(),
  send: jest.fn(),
  sendStatus: jest.fn(),
};

describe('renderer/helpers/errorHandler', () => {
  beforeEach(() => {
    path.join = jest.fn((...values) => {
      return values.indexOf('gluestick') ? 'default-505.hbs' : 'custom-505.hbs';
    });
    response.status = jest.fn();
    response.send = jest.fn();
    response.sendStatus = jest.fn();
  });

  afterAll(() => {
    jest.resetAllMocks();
    path.join = originalPathJoin;
    fs.stat = originalFsStat;
    fs.readFile = originalFsReadFile;
  });

  it('should render custom error page', () => {
    fs.stat = jest.fn((filename, callback) => {
      callback(null, { isFile: () => true });
    });
    fs.readFile = jest.fn((filename, options, callback) => {
      callback(null, 'custom');
    });
    errorHandler({}, response, {});
    expect(response.send.mock.calls[0][0]).toEqual('custom');
  });

  xit('should return 500 if error while reading custom template occured', () => {
    fs.stat = jest.fn((filename, callback) => {
      callback(null, { isFile: () => true });
    });
    fs.readFile = jest.fn((filename, options, callback) => {
      callback('error', null);
    });
    errorHandler({}, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should render default error page', () => {
    fs.stat = jest.fn((filename, callback) => {
      callback(null, { isFile: () => true });
    });
    fs.readFile = jest.fn((filename, options, callback) => {
      callback(null, 'default');
    });
    errorHandler({}, response, {});
    expect(response.send.mock.calls[0][0]).toEqual('default');
  });

  xit('should return 500 if error while reading default template occured', () => {
    fs.stat = jest.fn((filename, callback) => {
      callback(null, { isFile: () => filename === 'default-505.hbs' });
    });
    fs.readFile = jest.fn((filename, options, callback) => {
      callback('error', null);
    });
    errorHandler({}, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should return 501 if no error page was provided', () => {
    fs.stat = jest.fn((filename, callback) => {
      callback(null, { isFile: () => false });
    });
    errorHandler({}, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toBe(501);
  });
});
