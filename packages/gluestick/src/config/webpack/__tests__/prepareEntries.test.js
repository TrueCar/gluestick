/* @flow */
jest.mock(
  'entries.json',
  () => ({
    '/': {
      component: 'path/to/main/component',
      routes: 'path/to/main/routes',
      reducers: 'path/to/main/reducers',
    },
    '/home': {
      component: 'path/to/home/component',
      routes: 'path/to/home/routes',
      reducers: 'path/to/home/reducers',
      group: ['test-group-1', 'test-group-3'],
    },
    '/user': {
      component: 'path/to/user/component',
      routes: 'path/to/user/routes',
      reducers: 'path/to/user/reducers',
      group: ['test-group-2'],
    },
    '/profile': {
      component: 'path/to/profile/component',
      routes: 'path/to/profile/routes',
      reducers: 'path/to/profile/reducers',
      group: ['test-group-3'],
    },
    '/awesome-shop': {
      name: 'shop',
      component: 'path/to/shop/component',
      routes: 'path/to/shop/routes',
      reducers: 'path/to/shop/reducers',
    },
  }),
  { virtual: true },
);
jest.mock(
  'entries-invalid.json',
  () => ({
    '/main': {},
  }),
  { virtual: true },
);

const gluestickConfig = require('../../../__tests__/mocks/context').gsConfig;

const path = require('path');
const prepareEntries = require('../prepareEntries');

const originalPathJoin = path.join.bind(path);

describe('config/webpack/prepareEntries', () => {
  beforeEach(() => {
    path.join = jest.fn(() => 'entries.json');
  });

  afterAll(() => {
    jest.resetAllMocks();
    path.join = originalPathJoin;
  });

  it('should return every entry', () => {
    expect(Object.keys(prepareEntries(gluestickConfig))).toEqual([
      '/',
      '/home',
      '/user',
      '/profile',
      '/awesome-shop',
    ]);
  });

  it('should return single entry', () => {
    expect(Object.keys(prepareEntries(gluestickConfig, '/main'))).toEqual([
      '/',
    ]);

    expect(Object.keys(prepareEntries(gluestickConfig, '/home'))).toEqual([
      '/home',
    ]);

    expect(Object.keys(prepareEntries(gluestickConfig, '/profile'))).toEqual([
      '/profile',
    ]);

    expect(Object.keys(prepareEntries(gluestickConfig, '/user'))).toEqual([
      '/user',
    ]);

    expect(Object.keys(prepareEntries(gluestickConfig, '/shop'))).toEqual([
      '/awesome-shop',
    ]);
  });

  it('should return entries matching group', () => {
    expect(
      Object.keys(prepareEntries(gluestickConfig, 'test-group-1')),
    ).toEqual(['/home']);
    expect(
      Object.keys(prepareEntries(gluestickConfig, 'test-group-2')),
    ).toEqual(['/user']);
    expect(
      Object.keys(prepareEntries(gluestickConfig, 'test-group-3')),
    ).toEqual(['/home', '/profile']);
  });

  it('should throw error is entry key is `/main`', () => {
    path.join = jest.fn(() => 'entries-invalid.json');
    expect(() => {
      prepareEntries(gluestickConfig);
    }).toThrowError(
      '`/main` cannot be used as entry key, as `main` is a reserved word',
    );
  });

  it('should throw error if no entry is mathing specified app or group', () => {
    expect(() => {
      prepareEntries(gluestickConfig, '/should-not-find');
    }).toThrowError('No matching entry found');
  });
});
