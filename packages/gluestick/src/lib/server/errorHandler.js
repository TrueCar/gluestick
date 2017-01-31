import fs from "fs";
import path from "path";
import * as Handlebars from "handlebars";

/**
 * Register handlebars helper that allows condition blocks for non production
 * environments.
 *
 * Example:
 *  {{#notForProduction}}<pre>{{error.stack}}</pre>{{/notForProduction}}
 */
Handlebars.registerHelper("notForProduction", function (options) {
  return process.env.NODE_ENV === "production" ? "" : options.fn(this);
});

/**
 * The custom 505 error page uses handlebars for templates. We don't use
 * React because React might be responsible for for 505 error in the first
 * place. We do pass the request, response and error object to the template for
 * optional use.
 *
 * @param Express.Request req The request that triggered this error
 * @param Express.Response res The http response object for returning our response
 * @param Error error the error object that triggered this handler
 */
export default function serverErrorHandler(req, res, error, config={}) {
  res.status(error.status || 500);
  const custom505FilePath = path.join(process.cwd(), "505.hbs");
  res.log.error(error);

  // Check if we have a custom 505 error page
  fs.stat(custom505FilePath, (statError, stats) => {

    // If we don't have a custom 505 error page then just throw the stack trace
    if(statError || !stats.isFile()) {
      res.log.info(`No custom 505 page found. You can create a custom 505 page at ${path.join(process.cwd(), "505.hbs")}`);
      return res.end({error: error});
    }

    // If we do have a custom 505 page, render it
    fs.readFile(custom505FilePath, "utf8", (readFileError, data) => {
      if (readFileError) { return res.end({error: readFileError, config}); }

      // We use handlebars to deliver the 505 page. This lets you
      // use a handlebars template so you can display the stack trace or
      // any request, response information you would like.
      const output = Handlebars.compile(data)({req, res, error});
      res.end(output);
    });
  });
}

