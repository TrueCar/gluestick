const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

const gluestick505FilePath = path.join(process.cwd(), 'gluestick', '505.hbs');
const custom505FilePath = path.join(process.cwd(), '505.hbs');
// We use handlebars to deliver the 505 page. This lets you
// use a handlebars template so you can display the stack trace or
// any request, response information you would like.
Handlebars.registerHelper('notForProduction', (options) => {
  return process.env.NODE_ENV === 'production' ? '' : options.fn(this);
});

module.exports = (req, res, error) => {
  res.status(error.satus || 500);
  let output;
  // Check if we have a custom 505 error page
  fs.stat(custom505FilePath, (customErr, customStats) => {
    if (!customErr && customStats.isFile()) {
      // If we do have a custom 505 page, use it
      fs.readFile(custom505FilePath, 'utf8', (customReadFileError, customTemplate) => {
        output = customReadFileError ?
          undefined : Handlebars.compile(customTemplate)({ req, res, error });
        res.send(output);
      });
    } else {
      // If we don't have a custom 505 error page but have gluestick error page
      // we use gluestick one
      fs.stat(gluestick505FilePath, (gluestickErr, gluestickStats) => {
        if (!gluestickErr && gluestickStats.isFile()) {
          fs.readFile(gluestick505FilePath, 'utf8', (gluestickReadFileError, gluestickTemplate) => {
            output = gluestickReadFileError ?
              undefined : Handlebars.compile(gluestickTemplate)({ req, res, error });
            res.send(output);
          });
        } else {
          // If we don't have a custom or gluestick 505 error page then just return 501
          res.sendStatus(501);
        }
      });
    }
  });
};
