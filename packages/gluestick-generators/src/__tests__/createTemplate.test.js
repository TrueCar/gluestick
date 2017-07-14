const createTemplate = require('../createTemplate');

describe('generator/createTemplate tag function', () => {
  it('should render string', () => {
    const bakedTemplate = createTemplate`${'string'}`();
    expect(bakedTemplate).toEqual('string');
  });

  it('should render empty string if interpolated object does not have valid toString fn', () => {
    const object = Object.create(null);
    const bakedTemplate = createTemplate`${object}`();
    expect(bakedTemplate).toEqual('');
  });

  it('should render number', () => {
    const bakedTemplate = createTemplate`${10}`();
    expect(bakedTemplate).toEqual('10');
  });

  it('should render results of function', () => {
    const bakedTemplate = createTemplate`${args => args.someNumber}`({
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
      ${2 * 2}
      Some text 2
      ${args => args.someVar}
      Some text 3
    `({ someVar: 10 });
    expect(bakedTemplate).toEqual(expectedTemplate);
  });

  it('should render string without spaces', () => {
    const firstBakedTemplate = createTemplate(2)`  Some text`({});
    expect(firstBakedTemplate).toEqual('Some text');
    const secondExpectedTemplate = `    Some text
    4
    Some text 2
    10
    Some text 3
    `;
    const secondBakedTemplate = createTemplate(2)`
      Some text
      ${2 * 2}
      Some text 2
      ${args => args.someVar}
      Some text 3
      `({ someVar: 10 });
    expect(secondBakedTemplate).toEqual(secondExpectedTemplate);
  });

  it('should render string with spaces', () => {
    const bakedTemplate = createTemplate(0)`  Some text`({});
    expect(bakedTemplate).toEqual('  Some text');
    const secondExpectedTemplate = `    Some text
      4
      Some text 2
      10
      Some text 3
    `;
    const secondBakedTemplate = createTemplate(0)`
    Some text
      ${2 * 2}
      Some text 2
      ${args => args.someVar}
      Some text 3
    `({ someVar: 10 });
    expect(secondBakedTemplate).toEqual(secondExpectedTemplate);
  });

  it('shoud throw invalid params type error', () => {
    expect(() => {
      createTemplate(null);
    }).toThrowError('Invalid type, supporting only number');
    expect(() => {
      createTemplate(undefined);
    }).toThrowError('Invalid type, supporting only number');
    expect(() => {
      createTemplate(true);
    }).toThrowError('Invalid type, supporting only number');
    expect(() => {
      createTemplate(false);
    }).toThrowError('Invalid type, supporting only number');
    expect(() => {
      createTemplate('string');
    }).toThrowError('Invalid type, supporting only number');
  });
});
