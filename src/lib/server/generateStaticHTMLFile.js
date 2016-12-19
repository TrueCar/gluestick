import path from "path";
import { prepareOutput } from "./RequestHandler";
import { getLogger } from "./logger";
import fs from "fs-extra";
import WebpackIsomorphicTools from "webpack-isomorphic-tools";
import webpackConfig from "../../config/webpack-isomorphic-tools-config";
import detectEnvironmentVariables from "../detectEnvironmentVariables";
import getRenderRequirementsFromEntrypoints from "./getRenderRequirementsFromEntrypoints";

const LOGGER = getLogger();

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
        const Index = require(path.join(process.cwd(), "Index.js")).default;
        const renderRequirements = getRenderRequirementsFromEntrypoints(mockReq, mockRes, mockConfig);
        const output = await prepareOutput(mockReq, renderRequirements, {}, {}, envVars, true);
        fs.writeFileSync(path.join(process.cwd(), "build", "index.html"), output.responseString);
      }
      catch (e) {
        LOGGER.error(e);
      }
    });
}
