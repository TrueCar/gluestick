const getHeaders = require('../getHeaders');

describe('renderer/response/getHeaders', () => {
  it('should return null if no headers are provided', () => {
    expect(getHeaders({})).toBeNull();
  });

  it('should return headers from object', () => {
    const headers = {
      'cache-control': 'public, max-age: 50000',
    };
    expect(getHeaders({ headers })).toEqual(headers);
  });

  it('should return headers from function', () => {
    const headers = {
      'cache-control': 'public, max-age: 50000',
    };
    const cb = () => headers;
    expect(getHeaders({ headers: cb })).toEqual(headers);
  });
});
