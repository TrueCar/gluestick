const logger = require('../logger');
const colorScheme = require('../colorScheme');

describe('logger', () => {
  it('checks that logger options match with colorScheme', () => {
    Object.keys(logger).forEach((key) => {
      expect(colorScheme[key]).toBeDefined();
    });
  });
});
