const parseRoutePath = require('../parseRoutePath');

function testPath(path, passingSubjects, failingSubjects) {
  const regex = parseRoutePath(path);

  passingSubjects.forEach(item => {
    expect(regex.test(item)).toBeTruthy();
  });

  failingSubjects.forEach(item => {
    expect(regex.test(item)).toBeFalsy();
  });
}

describe('renderer/helpers/parseRoutePath', () => {
  it('should parse the path as regex', () => {
    testPath('/test/', ['/test', '/test1'], ['/', '/t']);
    testPath(
      '/review$/',
      ['/test/review', '/test-review', '/review'],
      ['/review/test'],
    );
  });

  it('should parse the path as string', () => {
    testPath('/test', ['/test'], ['/', '/t', '/test1']);
    testPath('/:var', ['/test'], ['/']);
    testPath('/test/:var', ['/test/index'], ['/', '/test']);
  });

  it('should match routes that begin with regex on non regex paths', () => {
    testPath(
      '/x',
      ['/x/123', '/x', '/x/123/abc/whatever'],
      ['/', '/t', '/test1'],
    );
  });
});
