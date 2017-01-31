import streamResponse from '../../../src/lib/server/streamResponse';

describe('test/lib/server/streamResponse', () => {
  const mockZlib = {
    createDeflate: jest.fn(() => 'deflate gate!'),
    createGzip: jest.fn(() => 'gzip!'),
  };

  const mockResponseBuffer = Buffer.from('hola hola hola');

  const mockCachedResponse = {
    status: 200,
    responseBuffer: mockResponseBuffer,
  };

  class MockReadable {
    static pipe;
    static push = jest.fn();
    static setEncoding = jest.fn();
    constructor() {
      this.setEncoding = MockReadable.setEncoding;
      this.push = MockReadable.push;
      MockReadable.pipe = jest.fn().mockImplementation(() => this);
      this.pipe = MockReadable.pipe;
    }
  }

  const mockResponse = {
    writeHead: jest.fn(),
  };

  const other = {
    'Content-Type': 'text/html; charset=utf-8',
  };

  beforeEach(() => {
    mockZlib.createDeflate.mockClear();
    mockZlib.createGzip.mockClear();
    mockResponse.writeHead.mockClear();
    // setEncodingSpy.reset();
    // pushSpy.reset();
  });

  it('should deflate if deflate supported and gzip not', () => {
    const mockRequest = {
      headers: {
        'accept-encoding': 'deflate',
      },
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createDeflate).toHaveBeenCalledTimes(1);
    expect(mockZlib.createGzip).toHaveBeenCalledTimes(0);
    expect(MockReadable.pipe).toBeCalledWith('deflate gate!');

    const lastCallArgs = mockResponse.writeHead.mock.calls[0];
    expect(lastCallArgs[0]).toEqual(200);
    expect(lastCallArgs[1]).toEqual({ 'Content-Encoding': 'deflate', ...other });
    expect(MockReadable.pipe).toBeCalledWith(mockResponse);
  });

  it('should gzip if gzip supported', () => {
    const mockRequest = {
      headers: {
        'accept-encoding': 'gzip',
      },
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createGzip).toHaveBeenCalledTimes(1);
    expect(mockZlib.createDeflate).toHaveBeenCalledTimes(0);
    expect(MockReadable.pipe).toBeCalledWith('gzip!');

    const lastCallArgs = mockResponse.writeHead.mock.calls[0];
    expect(lastCallArgs[0]).toEqual(200);
    expect(lastCallArgs[1]).toEqual({ 'Content-Encoding': 'gzip', ...other });
    expect(MockReadable.pipe).toBeCalledWith(mockResponse);
  });

  it('should gzip if gzip supported even if deflate is supported', () => {
    const mockRequest = {
      headers: {
        'accept-encoding': 'deflate, gzip',
      },
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createGzip).toHaveBeenCalledTimes(1);
    expect(mockZlib.createDeflate).toHaveBeenCalledTimes(0);
    expect(MockReadable.pipe).toBeCalledWith('gzip!');

    const lastCallArgs = mockResponse.writeHead.mock.calls[0];
    expect(lastCallArgs[0]).toEqual(200);
    expect(lastCallArgs[1]).toEqual({ 'Content-Encoding': 'gzip', ...other });
    expect(MockReadable.pipe).toBeCalledWith(mockResponse);
  });

  it('should not deflate or gzip if neither are supported', () => {
    const mockRequest = {
      headers: {},
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createDeflate).toHaveBeenCalledTimes(0);
    expect(mockZlib.createGzip).toHaveBeenCalledTimes(0);
    expect(MockReadable.pipe).not.toBeCalledWith('gzip!');
    expect(MockReadable.pipe).not.toBeCalledWith('deflate gate!');

    const lastCallArgs = mockResponse.writeHead.mock.calls[0];
    expect(lastCallArgs[0]).toEqual(200);
    expect(lastCallArgs[1]).toEqual({ ...other });
    expect(MockReadable.pipe).toBeCalledWith(mockResponse);
  });
});

