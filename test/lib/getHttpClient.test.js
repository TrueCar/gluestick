import getHttpClient from "../../src/lib/getHttpClient";
import sinon from "sinon";
import { expect } from "chai";

describe("lib/getHttpClient", () => {
  it("should call create with passed params", () => {
    const options = {
      headers: {
        "X-Todd": "Hi",
        "test": "best"
      },
      rewriteRequest: [() => {}]
    };
    const mockAxios = {
      create: sinon.spy()
    };
    const client = getHttpClient(options, undefined, mockAxios);
    expect(mockAxios.create.calledWith(options)).to.equal(true);
  });

  it("should merge request headers if request object is passed", () => {
    const options = {
      headers: {
        "X-Todd": "Hi",
        "test": "best"
      },
      test2: "hi"
    };
    const req = {
      headers: {
        "cookie": "name=Lincoln"
      }
    };
    const mockAxios = {
      create: sinon.spy()
    };
    const client = getHttpClient(options, req, mockAxios);
    expect(mockAxios.create.calledWith(options)).to.equal(false);

    const { headers, ...config } = options;
    expect(mockAxios.create.lastCall.args[0]).to.deep.equal({
      headers: {
        ...req.headers,
        ...headers
      },
      ...config
    });
  });
});

