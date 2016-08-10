/*global beforeEach describe it*/
import { expect } from "chai";
import sinon from "sinon";

import streamResponse from "../../../src/lib/server/streamResponse";

describe("test/lib/server/streamResponse", () => {
  const mockZlib = {
    createDeflate: sinon.stub().returns("deflate gate!"),
    createGzip: sinon.stub().returns("gzip!")
  };

  const mockResponseStream = {
    pipe: sinon.stub()
  };
  mockResponseStream.pipe.returns(mockResponseStream);

  const mockCachedResponse = {
    status: 200,
    responseStream: mockResponseStream
  };

  const mockResponse = {
    writeHead: sinon.spy()
  };

  beforeEach(() => {
    mockZlib.createDeflate.reset();
    mockZlib.createGzip.reset();
    mockResponseStream.pipe.reset();
    mockResponse.writeHead.reset();
  });

  it("should deflate deflate supported", () => {
    const mockRequest = {
      headers: {
        "accept-encoding": "gzip, deflate"
      }
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, mockZlib);

    expect(mockZlib.createDeflate.calledOnce).to.equal(true);
    expect(mockZlib.createGzip.callCount).to.equal(0);
    expect(mockResponseStream.pipe.calledWith("deflate gate!")).to.equal(true);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({"Content-Encoding": "deflate"});
    expect(mockResponseStream.pipe.calledWith(mockResponse)).to.equal(true);
  });

  it("should gzip if gzip supported and deflate is not", () => {
    const mockRequest = {
      headers: {
        "accept-encoding": "gzip"
      }
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, mockZlib);

    expect(mockZlib.createGzip.calledOnce).to.equal(true);
    expect(mockZlib.createDeflate.callCount).to.equal(0);
    expect(mockResponseStream.pipe.calledWith("gzip!")).to.equal(true);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({"Content-Encoding": "gzip"});
    expect(mockResponseStream.pipe.calledWith(mockResponse)).to.equal(true);
  });

  it("should not deflate or gzip if neither are supported", () => {
    const mockRequest = {
      headers: {}
    };

    streamResponse(mockRequest, mockResponse, mockCachedResponse, mockZlib);

    expect(mockZlib.createDeflate.callCount).to.equal(0);
    expect(mockZlib.createGzip.callCount).to.equal(0);
    expect(mockResponseStream.pipe.calledWith("gzip!")).to.equal(false);
    expect(mockResponseStream.pipe.calledWith("deflate gate!")).to.equal(false);

    const lastCallArgs = mockResponse.writeHead.lastCall.args;
    expect(lastCallArgs[0]).to.equal(200);
    expect(lastCallArgs[1]).to.deep.equal({});
    expect(mockResponseStream.pipe.calledWith(mockResponse)).to.equal(true);
  });
});

