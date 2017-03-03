/* @flow */
jest.mock('entries.json', () => ({
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
}), { virtual: true });
jest.mock('entries-invalid.json', () => ({
  '/main': {},
}), { virtual: true });

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
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({})),
    ).toEqual([
      '/',
      '/home',
      '/user',
      '/profile',
    ]);
  });

  it('should return single entry', () => {
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, '/')),
    ).toEqual([
      '/',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, '/main')),
    ).toEqual([
      '/',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, '/home')),
    ).toEqual([
      '/home',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, '/profile')),
    ).toEqual([
      '/profile',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, '/user')),
    ).toEqual([
      '/user',
    ]);
  });

  it('should return entries matching group', () => {
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, 'test-group-1')),
    ).toEqual([
      '/home',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, 'test-group-2')),
    ).toEqual([
      '/user',
    ]);
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, 'test-group-3')),
    ).toEqual([
      '/home',
      '/profile',
    ]);
  });

  it('should throw error is entry key is `/main`', () => {
    path.join = jest.fn(() => 'entries-invalid.json');
    expect(() => {
      // $FlowIgnore
      prepareEntries({});
    }).toThrowError('`/main` cannot be used as entry key, as `main` is a reserved word');
  });
});
