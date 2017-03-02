/* @flow */
require('./sharedMocks');

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
  });

  it('should return entries matching group', () => {
    expect(
      // $FlowIgnore
      Object.keys(prepareEntries({}, 'test-group')),
    ).toEqual([
      '/home',
    ]);
  });
});
