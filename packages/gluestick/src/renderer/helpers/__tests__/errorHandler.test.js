jest.mock('default-505.hbs', () => 'default', { virtual: true });
jest.mock('custom-505.hbs', () => 'custom', { virtual: true });
jest.mock('handlebars', () => ({
  registerHelper: jest.fn(),
  compile: jest.fn((template) => () => template),
}));

const errorHandler = require('../errorHandler');
const fs = require('fs');

const originalFsReadFile = fs.stat.bind(fs);

const response = {
  status: jest.fn(),
  send: jest.fn(),
  sendStatus: jest.fn(),
};

describe('renderer/helpers/errorHandler', () => {
  beforeEach(() => {
    response.status = jest.fn();
    response.send = jest.fn();
    response.sendStatus = jest.fn();
  });

  afterAll(() => {
    jest.resetAllMocks();
    fs.readFile = originalFsReadFile;
  });

  it('should render custom error page', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      callback(null, 'custom');
    });
    await errorHandler({}, response, {});
    expect(response.send.mock.calls[0][0]).toEqual('custom');
  });

  it('should return 500 if error while reading custom template occured', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      callback('error', null);
    });
    await errorHandler({}, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should render default error page', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      if (filename === 'custom-505.hbs') {
        callback({ code: 'ENOENT' }, null);
      } else if (filename === 'default-505.hbs') {
        callback(null, 'default');
      }
      callback('error', null);
    });
    await errorHandler({}, response, {}, 'custom-505.hbs', 'default-505.hbs');
    expect(response.send.mock.calls[0][0]).toEqual('default');
  });

  it('should return 500 if error while reading default template occured', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      if (filename === 'custom-505.hbs') {
        callback({ code: 'ENOENT' }, null);
      } else if (filename === 'default-505.hbs') {
        callback('error', null);
      }
    });
    await errorHandler({}, response, {}, 'custom-505.hbs', 'default-505.hbs');
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should return 501 if no error page was provided', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      callback({ code: 'ENOENT' }, null);
    });
    await errorHandler({}, response, {}, 'custom-505.hbs', 'default-505.hbs');
    expect(response.sendStatus.mock.calls[0][0]).toBe(501);
  });
});
