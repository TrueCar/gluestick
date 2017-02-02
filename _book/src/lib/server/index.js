import express from "express";
import compression from "compression";
import { getLogger, getLoggerMiddleware } from "./logger";
const logger = getLogger();
import gluestickExpressMiddleware from "./express-middleware";
import addProxies from "./addProxies";
import path from "path";
import serveAssets from "./serveAssets";

// Imported using `require` so that we can use `process.cwd()`
const config = require(path.join(process.cwd(), "src", "config", "application")).default;

const isProduction = process.env.NODE_ENV === "production";
// @TODO: allow host and port to be set elsewhere (https://github.com/TrueCar/gluestick/issues/129)
const port = process.env.PORT || (isProduction? 8888 : 8880);

const app = express();
app.use(getLoggerMiddleware());
app.use(compression());

// Hook up all of the API proxies
addProxies(app, config.proxies);

if (isProduction) {
  serveAssets(app);
  logger.info("Server side rendering server running");
}
else {
  app.get("/gluestick-proxy-poll", function(req, res) {
    // allow requests from our client side loading page
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(200).json({up: true});
  });
  logger.info("Server side rendering proxy running");
}

app.use(gluestickExpressMiddleware);
app.listen(port);

