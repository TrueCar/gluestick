const createTemplate = require('../../src/generator/createTemplate');

describe('generator/createTemplate tag function', () => {
  it('should render string', () => {
    const bakedTemplate = createTemplate`${'string'}`();
    expect(bakedTemplate).toEqual('string');
  });
  it('should render number', () => {
    const bakedTemplate = createTemplate`${10}`();
    expect(bakedTemplate).toEqual('10');
  });
  it('should render results of function', () => {
    const bakedTemplate = createTemplate`${
      args => args.someNumber
    }`({
      someNumber: 10,
    });
    expect(bakedTemplate).toEqual('10');
  });
  it('should throw missing args error', () => {
    expect(() => {
      createTemplate`${args => args.someVar}`();
    }).toThrowError('No arguments for for template were passed');
  });
  it('should interpolate template', () => {
    const expectedTemplate = `      Some text
      4
      Some text 2
      10
      Some text 3
    `;

    const bakedTemplate = createTemplate`
      Some text
      ${2 ** 2}
      Some text 2
      ${args => args.someVar}
      Some text 3
    `({ someVar: 10 });
    expect(bakedTemplate).toEqual(expectedTemplate);
  });
});
