/* @flow */
jest.mock('../../../../shared', () => ({
  ROUTE_NAME_404_NOT_FOUND: 'ROUTE_NAME_404_NOT_FOUND',
}));
const getStatusCode = require('../getStatusCode');

const getStore = _gluestick => ({
  getState: () => ({
    _gluestick,
  }),
});

describe('renderer/resonse/getStatusCode', () => {
  it('should return 200', () => {
    expect(getStatusCode(getStore({}), {})).toBe(200);
  });

  it('should return code from state', () => {
    // $FlowIgnore
    expect(getStatusCode(getStore({ statusCode: 204 }))).toBe(204);
  });

  it('should return 404', () => {
    expect(
      getStatusCode(getStore({}), { name: 'ROUTE_NAME_404_NOT_FOUND' }),
    ).toBe(404);
  });

  it('should return code from route', () => {
    expect(getStatusCode(getStore({}), { status: 304 })).toBe(304);
  });

  it('should throw error', () => {
    expect(() => {
      // $FlowIgnore
      getStatusCode(
        getStore({
          statusCode: true,
        }),
      );
    }).toThrowError('_gluestick.statusCode must be a number');
  });
});
