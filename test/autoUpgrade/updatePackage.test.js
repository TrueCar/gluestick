import { spy } from "sinon";
import { expect } from "chai";

import fixVersionMismatch, { isValidVersion, FIX_VERSION_MISMATCH_OVERRIDES } from "../../src/autoUpgrade/updatePackage";
import {
  missingProjectPackage,
  invalidProjectPackage,
  validProjectPackage,
  validLargerProjectPackage,
} from "../fixtures/projectPackages";


function mockLoadProjectPackage (fixture) {
  switch (fixture) {
    case "missing":
      return missingProjectPackage;
    case "invalid-version":
      return invalidProjectPackage;
    case "valid-larger":
      return validLargerProjectPackage;
    case "valid":
    default:
      return validProjectPackage;
  }
}

describe("autoUpgrade/updatePackage", () => {
  describe("fixVersionMismatch", () => {
    const prompt = spy();
    const overrides = {
      ...FIX_VERSION_MISMATCH_OVERRIDES,
      loadNewProjectPackage: mockLoadProjectPackage.bind(null, "valid"),
      rejectOnFailure: true,
      promptModulesUpdate: prompt
    };

    afterEach(() => {
      prompt.reset();
    });

    it("should prompt when there is a missing module", async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, "missing"),
        });
      }
      catch (e) {
        // NOOP
      }

      expect(prompt.called).to.equal(true);
      expect(prompt.lastCall.args[0].axios.project).to.equal("missing");
    });

    it("should prompt when there a module has lower than required version", async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, "invalid-version"),
        });
      }
      catch (e) {
        // NOOP
      }

      expect(prompt.called).to.equal(true);
    });

    it("should not prompt when module version match", async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadNewProjectPackage: mockLoadProjectPackage.bind(null, "valid"),
          loadProjectPackage: mockLoadProjectPackage.bind(null, "valid")
        });
      }
      catch (e) {
        // NOOP
      }

      expect(prompt.called).to.equal(false);
    });

    it("should not prompt when module version is larger", async () => {
      try {
        await fixVersionMismatch({
          ...overrides,
          loadProjectPackage: mockLoadProjectPackage.bind(null, "valid-larger")
        });
      }
      catch (e) {
        // NOOP
      }

      expect(prompt.called).to.equal(false);
    });
  });

  describe("isValidVersion", () => {
    it("should return true when version is greater than or equal requiredVersion", () => {
      expect(isValidVersion("10.0.0", "1.0.0")).to.be.true;
      expect(isValidVersion("0.0.2", "0.0.1")).to.be.true;
      expect(isValidVersion("2.1.1", "2.1.1")).to.be.true;
    });

    it("should return false when version is null or undefined", () => {
      const o = {};
      expect(isValidVersion(null, "1.0.0")).to.be.false;
      expect(isValidVersion(o.version, "0.0.1")).to.be.false;
    });

    it("should return false when version does not meet requirement", () => {
      expect(isValidVersion("10.0.0", "11.0.0")).to.be.false;
      expect(isValidVersion("0.0.2", "0.0.3")).to.be.false;
      expect(isValidVersion("2.1.1", "2.1.2")).to.be.false;
    });

    it("should return true when version is valid but starts with carrot or similar", () => {
      expect(isValidVersion("~10.0.0", "8.0.0")).to.be.true;
      expect(isValidVersion(">=10.0.0", "8.0.0")).to.be.true;
      expect(isValidVersion(">0.0.2", "0.0.1")).to.be.true;
      expect(isValidVersion("^2.1.1", "2.1.1")).to.be.true;
    });

    it("should return false when version starts with carrot or similar but is still too far behind", () => {
      expect(isValidVersion("~10.0.0", "11.0.0")).to.be.false;
      expect(isValidVersion(">=10.0.0", "11.0.0")).to.be.false;
      expect(isValidVersion(">0.0.2", "0.0.3")).to.be.false;
      expect(isValidVersion("^2.1.1", "2.5.1")).to.be.false;
    });
  });
});

