import path from "path";
import { prepareOutput } from "./RequestHandler";
import { getLogger } from "./logger";
import fs from "fs-extra";
import WebpackIsomorphicTools from "webpack-isomorphic-tools";
import webpackConfig from "../../config/webpack-isomorphic-tools-config";
import detectEnvironmentVariables from "../detectEnvironmentVariables";
import getRenderRequirementsFromEntrypoints from "./getRenderRequirementsFromEntrypoints";
import loadServerConfig from "./loadServerConfig";

const LOGGER = getLogger();

let config = {};
if (process.env.NODE_ENV !== "test") {
  const GLOBAL_CONFIG_PATH = path.join(process.cwd(), "src", "config", "application");
  const SERVER_CONFIG = loadServerConfig();
  const GLOBAL_CONFIG = require(GLOBAL_CONFIG_PATH).default;

  config = {
    ...GLOBAL_CONFIG,
    server: {
      ...SERVER_CONFIG
    }
  };
}

export default async function () {
  const mockReq = {
    headers: {
      host: "localhost"
    },
    url: "/"
  };

  const mockRes = {};
  const mockConfig = {};

  LOGGER.debug("about to run middleware");
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(webpackConfig)
    .development(false)
    .server(process.cwd(), async () => {
      try {
        const envVars = detectEnvironmentVariables(path.join(process.cwd(), "src", "config", "application.js"));
        const renderRequirements = getRenderRequirementsFromEntrypoints(mockReq, mockRes, mockConfig);
        const output = await prepareOutput(mockReq, renderRequirements, {}, config, envVars, true);
        fs.writeFileSync(path.join(process.cwd(), "build", "index.html"), output.responseString);
      }
      catch (e) {
        LOGGER.error(e);
      }
    });
}
