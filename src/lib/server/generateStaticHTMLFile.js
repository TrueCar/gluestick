import path from "path";
import { prepareOutput } from "./RequestHandler";
import { getLogger } from "./logger";
import WebpackIsomorphicTools from "webpack-isomorphic-tools";
import webpackConfig from "../../config/webpack-isomorphic-tools-config";
import detectEnvironmentVariables from "../detectEnvironmentVariables";

const LOGGER = getLogger();

export default async function () {
  const mockReq = {
    headers: {
      host: "localhost"
    },
    url: "/"
  };

  LOGGER.debug("about to run middleware");
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(webpackConfig)
    .development(false)
    .server(process.cwd(), async () => {
      try {
        const envVars = detectEnvironmentVariables(path.join(process.cwd(), "src", "config", "application.js"));
        const Index = require(path.join(process.cwd(), "Index.js")).default;
        const output = await prepareOutput(mockReq, {Index}, {}, {}, envVars, true);
        LOGGER.debug(output.responseString);
      }
      catch (e) {
        LOGGER.error(e);
      }
    });
}

