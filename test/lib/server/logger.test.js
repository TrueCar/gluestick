/*global beforeEach describe it*/
import { expect } from "chai";
import sinon from "sinon";
import {
  parseLogParams,
  pinoBaseConfig,
  setupLogParams
} from "../../../src/lib/server/logger";

describe("lib/server/logger", () => {

  const defaultConfig = {...pinoBaseConfig};

  describe("setupLogParams()", () => {

    describe("when no custom configuration is provided", () => {
      it("sets up logging with proper defaults", () => {
        const result = setupLogParams({});
        expect(result).to.deep.equal({
          logConfig: {
            ...defaultConfig
          },
          prettyConfig: null
        });
      });
    });

    describe("when a custom configuration is provided", () => {
      it("overrides the default level with the level provided", () => {
        const result = setupLogParams({level: "info"});
        expect(result).to.deep.equal({
          logConfig: {
            ...defaultConfig,
            level: "info"
          },
          prettyConfig: null
        });
      });

      it("overrides the pretty configuration with the one provided", () => {
        const result = setupLogParams({pretty: true});
        expect(result.prettyConfig).to.not.be.null;
      });

      it("overrides serializers with the ones provided", () => {
        const serializers = {
          req: sinon.spy(),
          res: sinon.spy(),
          error: sinon.spy()
        };
        const result = setupLogParams({serializers});
        expect(result).to.deep.equal({
          logConfig: {
            ...defaultConfig,
            serializers
          },
          prettyConfig: null
        });
      });
    });

    describe("when command line options are specified", () => {
      it("overrides the default level with the level provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logLevel: "debug"});
        const result = setupLogParams({});
        expect({
          logConfig: {
            name: "GlueStick",
            safe: true,
            level: "debug"
          },
          prettyConfig: null
        }).to.deep.equal(result);
        delete process.env.GS_COMMAND_OPTIONS;
      });

      it("overrides the app config level with the level provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logLevel: "debug"});
        const result = setupLogParams({level: "info"});
        expect({
          logConfig: {
            name: "GlueStick",
            safe: true,
            level: "debug"
          },
          prettyConfig: null
        }).to.deep.equal(result);
        delete process.env.GS_COMMAND_OPTIONS;
      });

      it("overrides the pretty option with the option provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logPretty: true});
        const result = setupLogParams({});
        expect(result.pretty).to.not.be.null;
        delete process.env.GS_COMMAND_OPTIONS;
      });
    });
  });

  describe("parseLogParams()", () => {
    it("handles no params", () => {
      const params = JSON.stringify({});
      expect(parseLogParams(params)).to.deep.equal({});
    });

    it("properly converts params", () => {
      const params = JSON.stringify({
        logLevel: "info",
        logPretty: true,
      });
      expect(parseLogParams(params)).to.deep.equal({level: "info", pretty: true});
    });
  });
});
