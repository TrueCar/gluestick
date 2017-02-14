const deepCopy = require('../deepCopy');

describe('config/webpack/deepCopy', () => {
  it('should deeply copy object', () => {
    const objectToClone = {
      nestedObject: {
        prop1: true,
      },
      prop1: 10,
    };
    const clonedObject = deepCopy(objectToClone);
    expect(clonedObject).toEqual(objectToClone);
    clonedObject.nestedObject.prop1 = false;
    expect(objectToClone.nestedObject.prop1).toBeTruthy();
  });
});
