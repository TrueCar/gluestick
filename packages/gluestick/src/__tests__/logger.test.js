// @flow
describe('logger', () => {
  let originalEnv;
  let logger;

  beforeEach(() => {
    jest.resetModules();
    originalEnv = process.env;
    jest.spyOn(process.stdout, 'write');
  });

  afterEach(() => {
    process.env = originalEnv;
    process.stdout.write.mockRestore();
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      logger = require('../logger').default;
    });

    it('sets up different log levels', () => {
      logger.info('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('INFO: hello\n');
      process.stdout.write.mockClear();
      logger.success('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('SUCCESS: hello\n');
      process.stdout.write.mockClear();
      logger.error('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('ERROR: hello\n');
      process.stdout.write.mockClear();
      logger.warn('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('WARN: hello\n');
      process.stdout.write.mockClear();
      logger.debug('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('DEBUG: hello\n');
      process.stdout.write.mockClear();
    });

    it('includes the type on log messages', () => {
      logger.info('hello');
      expect(process.stdout.write).toHaveBeenCalledWith('INFO: hello\n');
    });

    describe('objects', () => {
      it('formats objects with util.inspect', () => {
        logger.info({ hello: true });
        expect(process.stdout.write).toHaveBeenCalledWith(
          'INFO: { hello: true }\n',
        );
      });
    });
  });

  describe('in development', () => {
    let originalSend;
    beforeEach(() => {
      // need to do ugly stuff because this expects process.send to exist and it doesn't
      // (we're not in a subprocess in tests)
      originalSend = process.send;
      process.send = jest.fn();
      process.env.NODE_ENV = 'test';
      logger = require('../logger').default;
    });

    afterEach(() => {
      process.send = originalSend;
    });

    it('stringifies functions', () => {
      logger.info({ hello: true, func: () => {} });
      expect(process.send).toHaveBeenCalledWith({
        type: 'info',
        value: '[{"hello":true,"func":"[Function: func]"}]',
      });
    });
  });
});
