import path from "path";
import fs from "fs";
import * as RequestHandler from "./RequestHandler";
import errorHandler from "./errorHandler";
import detectEnvironmentVariables from "../detectEnvironmentVariables";
import getRenderRequirementsFromEntrypoints from "./getRenderRequirementsFromEntrypoints";

const GLOBAL_CONFIG_PATH = path.join(process.cwd(), "src", "config", "application");
const SERVER_CONFIG_PATH = `${GLOBAL_CONFIG_PATH}.server`;

let GLOBAL_CONFIG, SERVER_CONFIG, EXPOSED_ENV_VARIABLES;

if (process.env.NODE_ENV !== "test") {
  GLOBAL_CONFIG = require(GLOBAL_CONFIG_PATH).default;

  // Include application.server.js only if it exists
  try {
    fs.statSync(SERVER_CONFIG_PATH + ".js");
    SERVER_CONFIG = require(SERVER_CONFIG_PATH).default;
  }
  catch (e) {
    // NOOP
  }

  EXPOSED_ENV_VARIABLES = detectEnvironmentVariables(GLOBAL_CONFIG_PATH + ".js");
}

const defaults = {
  config: {
    ...GLOBAL_CONFIG,
    server: {
      ...SERVER_CONFIG
    }
  },
  RequestHandler,
  errorHandler,
  getRenderRequirementsFromEntrypoints,
  exposedEnvVariables: EXPOSED_ENV_VARIABLES
};

export default async (req, res, overrides) => {
  // Allow overriding of default methods, this is mostly to mock out methods
  // for testing
  const {
    config,
    RequestHandler,
    errorHandler,
    getRenderRequirementsFromEntrypoints,
    exposedEnvVariables
  } = {...defaults, ...overrides};

  try {
    if (RequestHandler.renderCachedResponse(req, res)) {
      return;
    }

    const renderRequirements = getRenderRequirementsFromEntrypoints(req, res, config);
    const {
      store,
      getRoutes,
    } = renderRequirements;

    const {
      redirectLocation,
      renderProps
    } = await RequestHandler.matchRoute(req, getRoutes, store);

    if (redirectLocation) {
      RequestHandler.redirect(redirectLocation);
      return;
    }

    if (!renderProps) {
      RequestHandler.renderNotFound(res);
      return;
    }

    await RequestHandler.runPreRenderHooks(req, renderProps, store);

    const currentRoute = RequestHandler.getCurrentRoute(renderProps);
    RequestHandler.setHeaders(res, currentRoute);

    const status = RequestHandler.getStatusCode(store.getState(), currentRoute);
    const output = RequestHandler.prepareOutput(req, renderRequirements, renderProps, config, exposedEnvVariables);
    RequestHandler.cacheAndRender(req, res, currentRoute, status, output);
  }
  catch (e) {
    errorHandler(req, res, e, config);
  }
};

