const setHeaders = require('../setHeaders');

const response = { set: jest.fn() };

describe('renderer/response/setHeaders', () => {
  beforeEach(() => {
    response.set = jest.fn();
  });

  it('should set the headers on the response object', () => {
    const currentRoute = { path: 'abc', headers: { a: 'hi' } };
    setHeaders(response, currentRoute);
    expect(response.set).toHaveBeenCalledWith(currentRoute.headers);
  });

  it('should not set any headers on the response object', () => {
    const currentRoute = { path: 'abc' };
    setHeaders(response, currentRoute);
    expect(response.set).not.toBeCalled();
  });
});
