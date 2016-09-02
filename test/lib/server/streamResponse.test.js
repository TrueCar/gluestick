/*global beforeEach describe it*/
import { expect } from "chai";
import sinon from "sinon";

import streamResponse from "../../../src/lib/server/streamResponse";

describe("test/lib/server/streamResponse", () => {
  const mockZlib = {
    createDeflate: sinon.stub().returns("deflate gate!"),
    createGzip: sinon.stub().returns("gzip!")
  };

  const mockResponseBuffer = Buffer.from("hola hola hola");

  const mockCachedResponse = {
    status: 200,
    responseBuffer: mockResponseBuffer
  };

  const setEncodingSpy = sinon.spy();
  const pushSpy = sinon.spy();

  class MockReadable {
    static pipe;
    static push = sinon.spy();
    static setEncoding = sinon.spy();
    constructor () {
      this.setEncoding = MockReadable.setEncoding;
      this.push = MockReadable.push;
      MockReadable.pipe = sinon.stub().returns(this);
      this.pipe = MockReadable.pipe;
    }
  }

  const mockResponse = {
    writeHead: sinon.spy()
  };

  const other = {
    "Content-Type": "text/html; charset=utf-8"
  };

  beforeEach(() => {
    mockZlib.createDeflate.reset();
    mockZlib.createGzip.reset();
    mockResponse.writeHead.reset();
    setEncodingSpy.reset();
    pushSpy.reset();
  });

  it("should deflate if deflate supported and gzip not", () => {
    const mockRequest = {
      headers: {
        "accept-encoding": "deflate"
      }
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createDeflate.calledOnce).to.equal(true);
    expect(mockZlib.createGzip.callCount).to.equal(0);
    expect(MockReadable.pipe.calledWith("deflate gate!")).to.equal(true);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({"Content-Encoding": "deflate", ...other});
    expect(MockReadable.pipe.calledWith(mockResponse)).to.equal(true);
  });

  it("should gzip if gzip supported", () => {
    const mockRequest = {
      headers: {
        "accept-encoding": "gzip"
      }
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createGzip.calledOnce).to.equal(true);
    expect(mockZlib.createDeflate.callCount).to.equal(0);
    expect(MockReadable.pipe.calledWith("gzip!")).to.equal(true);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({"Content-Encoding": "gzip", ...other});
    expect(MockReadable.pipe.calledWith(mockResponse)).to.equal(true);
  });

  it("should gzip if gzip supported even if deflate is supported", () => {
    const mockRequest = {
      headers: {
        "accept-encoding": "deflate, gzip"
      }
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createGzip.calledOnce).to.equal(true);
    expect(mockZlib.createDeflate.callCount).to.equal(0);
    expect(MockReadable.pipe.calledWith("gzip!")).to.equal(true);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({"Content-Encoding": "gzip", ...other});
    expect(MockReadable.pipe.calledWith(mockResponse)).to.equal(true);
  });

  it("should not deflate or gzip if neither are supported", () => {
    const mockRequest = {
      headers: {}
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, MockReadable, mockZlib);

    expect(mockZlib.createDeflate.callCount).to.equal(0);
    expect(mockZlib.createGzip.callCount).to.equal(0);
    expect(MockReadable.pipe.calledWith("gzip!")).to.equal(false);
    expect(MockReadable.pipe.calledWith("deflate gate!")).to.equal(false);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({...other});
    expect(MockReadable.pipe.calledWith(mockResponse)).to.equal(true);
  });
});

