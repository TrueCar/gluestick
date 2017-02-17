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
};

describe('renderer/helpers/getRequirementsFromEntry', () => {
  it('should return null if request url is invalid', () => {
    expect(getRequirementsFromEntry(
      context, { url: '/' }, entries,
    )).toBeNull();
  });

  it('should return entry', () => {
    expect(getRequirementsFromEntry(
      context, { url: '/home/abc' }, entries,
    )).toEqual({
      Component: 'component',
      reducers: 'reducers',
      routes: 'routes',
      name: '/home/abc',
    });
  });
});
