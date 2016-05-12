import express from "express";
import logger from "../logger";
import { filename } from "../logsColorScheme";
import requestHandler from "./requestHandler";
import addProxies from "./addProxies";
import path from "path";

// Imported using `require` so that we can use `process.cwd()`
const config = require(path.join(process.cwd(), "src", "config", "application")).default;

const isProduction = process.env.NODE_ENV === "production";
// @TODO: allow host and port to be set elsewhere (https://github.com/TrueCar/gluestick/issues/129)
const host = "localhost";
const port = process.env.PORT || (isProduction? 8888 : 8880);
const address = `http://${host}:${port}`;

const app = express();

// Hook up all of the API proxies
addProxies(app, config.proxies);

if (isProduction) {
  app.use("/assets", express.static("build"));
  logger.success(`Server side rendering server running`);
}
else {
  app.get("/gluestick-proxy-poll", function(req, res) {
    // allow requests from our client side loading page
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(200).json({up: true});
  });
  logger.success(`Server side rendering proxy running`);
}

app.use(requestHandler);
app.listen(port);

