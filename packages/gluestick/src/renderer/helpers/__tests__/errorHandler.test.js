jest.mock('default-500.hbs', () => 'default', { virtual: true });
jest.mock('custom-500.hbs', () => 'custom', { virtual: true });
jest.mock('handlebars', () => ({
  registerHelper: jest.fn(),
  compile: jest.fn(template => () => template),
}));

const errorHandler = require('../errorHandler');
const fs = require('fs');

const originalFsReadFile = fs.stat.bind(fs);

const response = {
  status: jest.fn(),
  send: jest.fn(),
  sendStatus: jest.fn(),
};

const request = {};
const context = {
  config: {
    GSConfig: {
      customErrorTemplatePath: 'custom-500.hbs',
      defaultErrorTemplatePath: 'default-500.hbs',
    },
  },
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
    await errorHandler(context, request, response, {});
    expect(response.send.mock.calls[0][0]).toEqual('custom');
  });

  it('should return 500 if error while reading custom template occured', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      callback('error', null);
    });
    await errorHandler(context, request, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should render default error page', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      if (filename === 'custom-500.hbs') {
        callback({ code: 'ENOENT' }, null);
      } else if (filename === 'default-500.hbs') {
        callback(null, 'default');
      }
      callback('error', null);
    });
    await errorHandler(context, request, response, {});
    expect(response.send.mock.calls[0][0]).toEqual('default');
  });

  it('should return 500 if error while reading default template occured', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      if (filename === 'custom-500.hbs') {
        callback({ code: 'ENOENT' }, null);
      } else if (filename === 'default-500.hbs') {
        callback('error', null);
      }
    });
    await errorHandler(context, request, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toEqual(500);
  });

  it('should return 501 if no error page was provided', async () => {
    fs.readFile = jest.fn((filename, options, callback) => {
      callback({ code: 'ENOENT' }, null);
    });
    await errorHandler(context, request, response, {});
    expect(response.sendStatus.mock.calls[0][0]).toBe(501);
  });
});
