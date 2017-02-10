//jest.mock('testPlugin');
const path = require('path');
const preparePlugins = require('../preparePlugins');

const originalPath = path.join.bind({});

describe('config/preparePlugins', () => {
  beforeEach(() => {
    path.join = jest.fn().mockImplementation(
      () => originalPath(__dirname, '../__mocks__/testPlugin.js'),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    path.join = originalPath;
  });

  it('should return empty array if plugins field is not an array', () => {
    expect(preparePlugins({})).toEqual([]);
  });

  it('should return plugins array', () => {
    expect(preparePlugins({ plugins: ['testPlugin'] })).toEqual([{
      name: 'testPlugin',
      body: 'body of testPlugin',
    }]);
  });
});
