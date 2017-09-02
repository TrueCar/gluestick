/* @flow */

const completion = require("../completion").default;

describe("gluestick-cli/src/completion.js", () => {
  it("should be callable", () => {
    completion(".", []);
  });

});
