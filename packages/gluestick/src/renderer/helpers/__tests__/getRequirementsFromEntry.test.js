const clone = require('clone');
const getRequirementsFromEntry = require('../getRequirementsFromEntry');

const context = {
  config: {},
  logger: {
    debug: jest.fn(),
  },
};
const entries = {
  '/home': {
    component: '',
    reducers: '',
    routes: '',
    name: 'home',
  },
  '/home/abc': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
  '/home/def': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
};

describe('renderer/helpers/getRequirementsFromEntry', () => {
  it('should throw error if entry definition was not found', () => {
    expect(() => {
      getRequirementsFromEntry(context, { url: '/' }, entries);
    }).toThrowError('No matching entry definition found');
  });

  it('should return entry', () => {
    expect(
      getRequirementsFromEntry(context, { url: '/home/abc' }, entries),
    ).toEqual({
      Component: 'component',
      reducers: 'reducers',
      routes: 'routes',
      config: null,
      name: '/home/abc',
      key: '/home/abc',
    });
  });

  it('should return entry with custom name and config', () => {
    const entriesWithCustomName = clone(entries);
    entriesWithCustomName['/home/abc'].name = 'custom';
    entriesWithCustomName['/home/abc'].config = { test: true };
    expect(
      getRequirementsFromEntry(
        context,
        { url: '/home/abc' },
        entriesWithCustomName,
      ),
    ).toEqual({
      Component: 'component',
      reducers: 'reducers',
      routes: 'routes',
      config: { test: true },
      name: 'custom',
      key: '/home/abc',
    });
  });
});
