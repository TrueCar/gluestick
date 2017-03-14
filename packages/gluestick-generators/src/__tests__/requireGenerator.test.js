let fsMock = {};
jest.setMock('fs', {
  existsSync: path => typeof fsMock[path] !== 'undefined',
});
jest.mock('cwd/generators/test.js', () => 'test', { virtual: true });

const path = require('path');
const requireGenerator = require('../requireGenerator');

describe('generator/requireGenerator', () => {
  beforeEach(() => {
    fsMock = {};
  });

  it('should thow error if generator config was not found', () => {
    expect(() => {
      requireGenerator('Test');
    }).toThrowError();
  });

  it('should return generator config', () => {
    const originalProcessCwd = process.cwd.bind(process);
    process.cwd = () => 'cwd';
    fsMock[path.join(process.cwd(), 'generators', 'test.js')] = 'test';
    expect(requireGenerator('test')).toEqual({
      name: 'test',
      config: 'test',
    });
    process.cwd = originalProcessCwd;
  });
});
