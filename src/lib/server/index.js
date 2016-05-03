import express from "express";
import logger from "../logger";
import { filename } from "../logsColorScheme";
import requestHandler from "./requestHandler";

const isProduction = process.env.NODE_ENV === "production";
// @TODO: allow host and port to be set elsewhere (https://github.com/TrueCar/gluestick/issues/129)
const host = "localhost";
const port = process.env.PORT || (isProduction? 8888 : 8880);
const address = `http://${host}:${port}`;

const app = express();

if (isProduction) {
  app.use("/assets", express.static("build"));
  logger.success(`Server side rendering server running at ${filename(address)}`);
}
else {
  app.get("/gluestick-proxy-poll", function(req, res) {
    // allow requests from our client side loading page
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(200).json({up: true});
  });
  logger.success(`Server side rendering proxy running at ${filename(address)}`);
}

app.use(requestHandler);
app.listen(port);
