const generator = require('../');

describe('generatro/index', () => {
  it('should throw error if name is not alphanumberical', () => {
    expect(() => {
      generator({
        entityName: '@',
      });
    }).toThrowError('Invalid name specified');
  });
});
