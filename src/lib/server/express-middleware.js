import path from "path";
import * as RequestHandler from "./RequestHandler";
import errorHandler from "./errorHandler";
import detectEnvironmentVariables from "../detectEnvironmentVariables";
import getRenderRequirementsFromEntrypoints from "./getRenderRequirementsFromEntrypoints";

const CONFIG_PATH = path.join(process.cwd(), "src", "config", "application");

let CONFIG, EXPOSED_ENV_VARIABLES;
if (process.env.NODE_ENV !== "test") {
  CONFIG = require(CONFIG_PATH).default;
  EXPOSED_ENV_VARIABLES = detectEnvironmentVariables(CONFIG_PATH + ".js");
}

const defaults = {
  config: CONFIG,
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
      RequestHandler.redirect(res, redirectLocation);
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

