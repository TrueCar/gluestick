const parseConfig = require('../parseConfig');
const createTemplate = require('../createTemplate');

describe('generator/parseConfig', () => {
  it('should merge args properly', () => {
    const config = parseConfig(
      options => ({
        args: {
          name: options.name,
        },
        entry: {
          path: 'path/to/directory',
          filename: 'Test',
          template: createTemplate`${args => args.name}`,
          args: {
            name: 'TestNameOverride',
          },
        },
      }),
      {
        name: 'TestName',
      },
    );
    expect(config).toEqual({
      args: {
        name: 'TestName',
      },
      entry: {
        path: 'path/to/directory',
        filename: 'Test.js',
        template: 'TestNameOverride',
        args: {
          name: 'TestNameOverride',
        },
      },
    });
  });

  it('should parse config with object config', () => {
    const config = parseConfig(
      {
        args: {
          name: 'TestName',
        },
        entry: {
          path: 'path/to/directory',
          filename: 'Test',
          template: createTemplate`${args => args.name}`,
        },
      },
      {},
    );
    expect(config).toEqual({
      args: {
        name: 'TestName',
      },
      entry: {
        path: 'path/to/directory',
        filename: 'Test.js',
        template: 'TestName',
      },
    });
  });

  it('should parse config with functional config', () => {
    const config = parseConfig(
      options => ({
        args: {
          name: options.name,
        },
        entry: {
          path: 'path/to/directory',
          filename: options.filename,
          template: createTemplate`${args => args.name}`,
        },
      }),
      {
        name: 'TestName',
        filename: 'Test',
      },
    );
    expect(config).toEqual({
      args: {
        name: 'TestName',
      },
      entry: {
        path: 'path/to/directory',
        filename: 'Test.js',
        template: 'TestName',
      },
    });
  });

  it('should parse config with multiple entries', () => {
    const config = parseConfig(
      options => ({
        entries: [
          {
            path: 'path/to/directory',
            filename: 'Test1',
            template: createTemplate`${args => args.name}`,
            args: {
              name: 'TestName1',
            },
          },
          {
            path: 'path/to/directory',
            filename: options.name,
            template: createTemplate`${args => args.name}`,
            args: {
              name: options.name,
            },
          },
        ],
      }),
      {
        name: 'TestName2',
      },
    );
    expect(config).toEqual({
      entries: [
        {
          path: 'path/to/directory',
          filename: 'Test1.js',
          template: 'TestName1',
          args: {
            name: 'TestName1',
          },
        },
        {
          path: 'path/to/directory',
          filename: 'TestName2.js',
          template: 'TestName2',
          args: {
            name: 'TestName2',
          },
        },
      ],
    });
  });

  it('should throw error if entry is not valid', () => {
    expect(() => {
      parseConfig(
        options => ({
          args: {
            name: options.name,
          },
        }),
        {
          name: 'TestName',
          generator: 'TestGenerator',
        },
      );
    }).toThrowError('No entry defined for generator TestGenerator');
  });

  it('should throw error if no entry was defined', () => {
    expect(() => {
      parseConfig(
        {
          entry: {
            path: 1,
          },
        },
        {
          name: 'TestName',
          generator: 'TestGenerator',
        },
      );
    }).toThrowError('Entry in generator TestGenerator is not valid');
    expect(() => {
      parseConfig(
        {
          entry: {
            path: 1,
          },
        },
        {
          name: 'TestName',
          generator: 'TestGenerator',
        },
      );
    }).toThrowError('Entry in generator TestGenerator is not valid');
    expect(() => {
      parseConfig(
        {
          entry: {
            path: '',
          },
        },
        {
          name: 'TestName',
          generator: 'TestGenerator',
        },
      );
    }).toThrowError('Entry in generator TestGenerator is not valid');
    expect(() => {
      parseConfig(
        {
          entry: {
            path: '',
            filename: '',
            template: null,
          },
        },
        {
          name: 'TestName',
          generator: 'TestGenerator',
        },
      );
    }).toThrowError('Entry in generator TestGenerator is not valid');
  });

  it('should parse config with additional directory in name filed', () => {
    // Additional directory must be added manually to entry path
    const config = parseConfig(
      {
        args: {
          name: 'TestName',
        },
        entry: {
          path: 'path/to/directory',
          filename: 'Test',
          template: createTemplate`${args => args.name}`,
        },
      },
      {
        dir: 'additionalDir',
      },
    );
    expect(config).toEqual({
      args: {
        name: 'TestName',
      },
      entry: {
        path: 'path/to/directory',
        filename: 'Test.js',
        template: 'TestName',
      },
    });
  });

  it('should not parse filename begins from "."', () => {
    const config = parseConfig(
      {
        args: {
          name: 'TestName',
        },
        entry: {
          path: 'path/to/directory',
          filename: '.Test',
          template: createTemplate`${args => args.name}`,
        },
      },
      {},
    );
    expect(config).toEqual({
      args: {
        name: 'TestName',
      },
      entry: {
        path: 'path/to/directory',
        filename: '.Test',
        template: 'TestName',
      },
    });
  });
});
