let fsMock = {};
jest.setMock('fs', {
  existsSync: path => typeof fsMock[path] !== 'undefined',
  writeFileSync: (path, data) => {
    fsMock[path] = data;
  },
  readFileSync: path => fsMock[path],
});
jest.setMock('mkdirp', {
  sync: () => {},
});

const path = require('path');
const writeTemplate = require('../writeTemplate.js');

const entryFixture = {
  path: 'example',
  filename: 'example.js',
  template: 'example',
};
const pathFixture = path.join(process.cwd(), 'example/example.js');

describe('generator/writeTemplate', () => {
  beforeEach(() => {
    fsMock = {};
  });

  it('should write single entry', () => {
    writeTemplate({
      entry: Object.assign({}, entryFixture),
    });
    expect(fsMock[pathFixture]).toEqual('example');
  });

  it('should write multiple entries', () => {
    const secondEntry = Object.assign({}, entryFixture, {
      filename: 'example0.js',
    });
    writeTemplate({
      entries: [Object.assign({}, entryFixture), secondEntry],
    });
    expect(fsMock[pathFixture]).toEqual('example');
    expect(fsMock[path.join(process.cwd(), 'example/example0.js')]).toEqual(
      'example',
    );
  });

  it('should throw error if file already exists', () => {
    fsMock[pathFixture] = 'sth';
    expect(() => {
      writeTemplate({
        entry: entryFixture,
      });
    }).toThrowError(`File ${pathFixture} alredy exists`);
  });

  it('should apply single modification', () => {
    const pathToIndex = path.join(process.cwd(), 'example/index.js');
    fsMock[pathToIndex] = 'index';
    writeTemplate({
      modify: {
        file: 'example/index.js',
        modifier: content => `new ${content}`,
      },
      entry: entryFixture,
    });
    expect(fsMock[pathToIndex]).toEqual('new index');
  });

  it('should apply single modification without specified extension', () => {
    const pathToIndex = path.join(process.cwd(), 'example/index.js');
    fsMock[pathToIndex] = 'index';
    writeTemplate({
      modify: {
        file: 'example/index',
        modifier: content => `new ${content}`,
      },
      entry: entryFixture,
    });
    expect(fsMock[pathToIndex]).toEqual('new index');
  });

  it('should apply multiple modifications', () => {
    const pathToIndex0 = path.join(process.cwd(), 'example/index0.js');
    const pathToIndex1 = path.join(process.cwd(), 'example/index1.js');
    fsMock[pathToIndex0] = 'index';
    fsMock[pathToIndex1] = 'index';
    writeTemplate({
      modify: [
        {
          file: 'example/index0.js',
          modifier: content => `new 0 ${content}`,
        },
        {
          file: 'example/index1.js',
          modifier: content => `new 1 ${content}`,
        },
      ],
      entry: entryFixture,
    });
    expect(fsMock[pathToIndex0]).toEqual('new 0 index');
    expect(fsMock[pathToIndex1]).toEqual('new 1 index');
  });

  it('should create new file from modificator if does not exists', () => {
    const pathToIndex = path.join(process.cwd(), 'example/index.js');
    writeTemplate({
      modify: {
        file: 'example/index.js',
        modifier: content => `new ${content}`,
      },
      entry: entryFixture,
    });
    expect(fsMock[pathToIndex]).toEqual('new null');
  });

  it('should throw error if modificator returns non-string value', () => {
    const pathToIndex = path.join(process.cwd(), 'example/index.js');
    expect(() => {
      writeTemplate({
        modify: {
          file: 'example/index.js',
          modifier: () => 1,
        },
        entry: entryFixture,
      });
    }).toThrowError(`Modified content for ${pathToIndex} must be a string`);
  });
});
