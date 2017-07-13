const isChildPath = require('../isChildPath');

describe('renderer/helpers/isChildPath', () => {
  it('should return true if `child` is a child of `parent`', () => {
    const shouldBeTrue = [
      ['/my', '/my/test'],
      ['/my', '/my'],
      ['/my', '/my?'],
      ['/my', '/my?test'],
      ['/', '/anything'],
      ['/this/one/is/really/long', '/this/one/is/really/long/too'],
    ];
    shouldBeTrue.forEach(pair => {
      expect(isChildPath(pair[0], pair[1])).toEqual(true);
    });
  });

  it('should return false if `child` is not a child of `parent`', () => {
    const shouldBeFalse = [
      ['/my', '/best/test'],
      ['/my', '/m'],
      ['/m', '/my'],
      ['/this/one/is/really/long', '/this/one'],
      ['/this/shouldnotmatch', '/this/shouldnot'],
    ];
    shouldBeFalse.forEach(pair => {
      expect(isChildPath(pair[0], pair[1])).toEqual(false);
    });
  });
});
