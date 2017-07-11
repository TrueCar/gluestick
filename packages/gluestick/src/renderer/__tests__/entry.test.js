jest.mock('../main', () => jest.fn());
const main = require('../main');

const original = process.argv[2];
const originalProcessSend = process.send
  ? process.send.bind(process)
  : process.send;

describe('renderer/entry', () => {
  beforeEach(() => {
    process.argv[2] = JSON.stringify({ prop: 'value' });
    process.send = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.argv[2] = original;
    process.send = originalProcessSend;
  });

  it('should prepare and exec server main file', () => {
    require('../entry');
    expect(main.mock.calls[0][0].config).toEqual({
      prop: 'value',
    });
    Object.keys(main.mock.calls[0][0].logger).forEach((key, index) => {
      const logFn = main.mock.calls[0][0].logger[key];
      expect(logFn).toBeDefined();
      logFn('test message');
      expect(process.send.mock.calls[index][0]).toEqual({
        type: key,
        value: '["test message"]',
      });
    });
  });
});
