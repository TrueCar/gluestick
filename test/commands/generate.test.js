jest.mock("../../src/generator");

const generate = require("../../src/commands/generate");
const generator = require("../../src/generator");
const logger = require("../../src/lib/cliLogger");

describe("cli: gluestick generate", () => {
  it("calls the generator with correct parameters", () => {
    generate("component", "MyComponent", {});
    expect(generator).toBeCalledWith(
      {
        "entityName": "MyComponent",
        "generatorName": "component",
        "options": {
          "functional": void 0,
        }
      },
      logger
    );
  });
});
