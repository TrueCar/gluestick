const logger = require('../logger');
const colorScheme = require('../colorScheme');

describe('logger', () => {
  expect.extend({
    toContainKey(received, item) {
      const pass = !!received[item] === true;
      return { actual: received, message: () => `Key '${item}' not found in ${received}`, pass };
    },
  });

  it('checks that logger options match with colorScheme', () => {
    Object.keys(logger).forEach((key) => {
      expect(colorScheme).toContainKey(key);
    });
  });
});
