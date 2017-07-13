/* @flow */
jest.mock('cwd/noEntries.json', () => ({}), { virtual: true });
jest.mock(
  'cwd/entryName.json',
  () => ({
    '/test1': {
      component: '',
    },
  }),
  { virtual: true },
);
jest.mock(
  'cwd/entryPathMatch.json',
  () => ({
    '/': {
      component: 'src/apps/main/Index.js',
    },
  }),
  { virtual: true },
);
jest.mock(
  'cwd/entriesFilter.json',
  () => ({
    '/test2': {
      component: '',
    },
    '/home': {
      name: 'Home',
      component: 'src/apps/home/Index.js',
    },
  }),
  { virtual: true },
);
jest.mock(
  'cwd/entries.json',
  () => ({
    '/home': {
      name: 'Home',
      component: 'src/apps/home/Index.js',
    },
    '/profile': {
      component: 'src/external/profile/Index.js',
    },
  }),
  { virtual: true },
);
jest.mock('fs', () => ({
  existsSync: value => {
    if (value.includes('test2')) {
      return false;
    }
    return true;
  },
}));

const orignalProcessCwd = process.cwd.bind(process);

const defaultGluesticConfig = require('../../defaults/glueStickConfig');
const getAliasesForApps = require('../getAliasesForApps');

const mockGSConfig = mockedConfig => {
  return {
    ...defaultGluesticConfig,
    ...mockedConfig,
  };
};

describe('config/webpack/getAliasesForApps', () => {
  beforeEach(() => {
    // $FlowIgnore flow does not like this
    process.cwd = () => 'cwd';
  });

  afterAll(() => {
    // $FlowIgnore flow does not like this
    process.cwd = orignalProcessCwd;
  });

  it('should return empty object', () => {
    expect(
      getAliasesForApps(mockGSConfig({ entriesPath: 'noEntries.json' })),
    ).toEqual({});
  });

  it('should return alias from name', () => {
    expect(
      getAliasesForApps(
        mockGSConfig({
          entriesPath: 'entryName.json',
          sourcePath: '',
          appsPath: '',
        }),
      ),
    ).toEqual({
      test1: 'cwd/test1',
    });
  });

  it('should return alias from path match', () => {
    expect(
      getAliasesForApps(
        mockGSConfig({
          entriesPath: 'entryPathMatch.json',
        }),
      ),
    ).toEqual({
      main: 'cwd/src/apps/main',
    });
  });

  it('should return filter and return object with aliases', () => {
    expect(
      getAliasesForApps(
        mockGSConfig({
          entriesPath: 'entriesFilter.json',
          sourcePath: '',
          appsPath: '',
        }),
      ),
    ).toEqual({
      Home: 'cwd/src/apps/home',
    });
  });

  it('should return multiple aliases', () => {
    expect(
      getAliasesForApps(
        mockGSConfig({
          entriesPath: 'entries.json',
          sourcePath: 'src',
          appsPath: 'apps',
        }),
      ),
    ).toEqual({
      Home: 'cwd/src/apps/home',
      profile: 'cwd/src/apps/profile',
    });
  });
});
