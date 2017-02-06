import {
  parseLogOptions,
  pinoBaseConfig,
  getLogConfig
} from "../../../src/lib/server/logger";

describe("lib/server/logger", () => {

  const defaultConfig = {...pinoBaseConfig};

  describe("getLogConfig()", () => {

    describe("when no custom configuration is provided", () => {
      it("sets up logging with proper defaults even when no config is provided", () => {
        const result = getLogConfig(undefined); // eslint-disable-line no-undefined
        expect(result).toEqual({
          logConfig: {
            ...defaultConfig
          },
          prettyConfig: null
        });
      });

      it("sets up logging with proper defaults when an empty config is provided", () => {
        const result = getLogConfig({});
        expect(result).toEqual({
          logConfig: {
            ...defaultConfig
          },
          prettyConfig: null
        });
      });
    });

    describe("when a custom configuration is provided", () => {
      it("overrides the default level with the level provided", () => {
        const result = getLogConfig({level: "info"});
        expect(result).toEqual({
          logConfig: {
            ...defaultConfig,
            level: "info"
          },
          prettyConfig: null
        });
      });

      it("overrides the pretty configuration with the one provided", () => {
        const result = getLogConfig({pretty: true});
        expect(result.prettyConfig).not.toBeNull();
      });

      it("overrides serializers with the ones provided", () => {
        const serializers = {
          req: jest.fn(),
          res: jest.fn(),
          error: jest.fn()
        };
        const result = getLogConfig({serializers});
        expect(result).toEqual({
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
        const result = getLogConfig({});
        expect({
          logConfig: {
            name: "GlueStick",
            safe: true,
            level: "debug"
          },
          prettyConfig: null
        }).toEqual(result);
        delete process.env.GS_COMMAND_OPTIONS;
      });

      it("overrides the app config level with the level provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logLevel: "debug"});
        const result = getLogConfig({level: "info"});
        expect({
          logConfig: {
            name: "GlueStick",
            safe: true,
            level: "debug"
          },
          prettyConfig: null
        }).toEqual(result);
        delete process.env.GS_COMMAND_OPTIONS;
      });

      it("overrides the pretty option with the option provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logPretty: true});
        const result = getLogConfig({});
        expect(result.prettyConfig).not.toBeNull();
        delete process.env.GS_COMMAND_OPTIONS;
      });

      it("overrides the app config pretty option with the option provided", () => {
        process.env.GS_COMMAND_OPTIONS = JSON.stringify({logPretty: false});
        const result = getLogConfig({pretty: true});
        expect(result.prettyConfig).toBeNull();
        delete process.env.GS_COMMAND_OPTIONS;
      });
    });
  });

  describe("parseLogOptions()", () => {
    it("handles no params", () => {
      const params = JSON.stringify({});
      expect(parseLogOptions(params)).toEqual({});
    });

    it("properly converts params", () => {
      const params = JSON.stringify({
        logLevel: "info",
        logPretty: true,
      });
      expect(parseLogOptions(params)).toEqual({level: "info", pretty: true});
    });

    it("properly converts falsey params", () => {
      const params = JSON.stringify({
        logLevel: "info",
        logPretty: false,
      });
      expect(parseLogOptions(params)).toEqual({level: "info", pretty: false});
    });

    it("excludes null options", () => {
      const params = JSON.stringify({
        logLevel: null,
        logPretty: false,
      });
      expect(parseLogOptions(params)).toEqual({pretty: false});
    });

    it("excludes undefined options", () => {
      const params = JSON.stringify({
        logLevel: undefined, // eslint-disable-line no-undefined
        logPretty: false,
      });
      expect(parseLogOptions(params)).toEqual({pretty: false});
    });
  });
});
