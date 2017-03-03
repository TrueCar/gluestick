const fsMock = {};
jest.setMock('fs', {
  existsSync: path => typeof fsMock[path] !== 'undefined',
});

const requireGenerator = require('../requireGenerator');

describe('generator/requireGenerator', () => {
  it('should thow error if generator config was not found', () => {
    expect(() => {
      requireGenerator('Test');
    }).toThrowError();
  });
});
