import fs from "fs";
import path from "path";
import * as secureHandlebars from "secure-handlebars";

/**
 * Register handlebars helper that allows condition blocks for non production
 * environments.
 *
 * Example:
 *  {{#notForProduction}}<pre>{{error.stack}}</pre>{{/notForProduction}}
 */
secureHandlebars.registerHelper("notForProduction", function (options) {
  return process.env.NODE_ENV === "production" ? "" : options.fn(this);
});

/**
 * The custom 500 error page uses secure-handlebars for templates. We don't use
 * React because React might be responsible for for 500 error in the first
 * place. We do pass the request, response and error object to the template for
 * optional use.
 *
 * @param Express.Request req The request that triggered this error
 * @param Express.Response res The http response object for returning our response
 * @param Error error the error object that triggered this handler
 */
export default function serverErrorHandler(req, res, error) {
  res.status(500);
  res.log.error(error);

  const custom500FilePath = path.join(process.cwd(), "500.hbs");

  // Check if we have a custom 500 error page
  fs.stat(custom500FilePath, (statError, stats) => {

    if(statError || !stats.isFile()) {
      res.log.info(`No custom 500 page found. You can create a custom 500 page at ${custom500FilePath}`);
      return res.send({error: error});
    }

    // If we do have a custom 500 page, render it
    fs.readFile(custom500FilePath, "utf8", (readFileError, data) => {
      if (readFileError) { return res.send({error: readFileError}); }

      // We use secure-handlebars to deliver the 500 page. This lets you
      // use a handlebars template so you can display the stack trace or
      // any request, response information you would like.
      const output = secureHandlebars.compile(data)({req, res, error});
      res.send(output);
    });
  });
}

