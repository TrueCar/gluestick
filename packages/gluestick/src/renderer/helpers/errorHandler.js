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

// It is a helper function which check if file exist
const isFile = (filePath) => fs.stat(filePath, (err, stats) => !err && stats.isFile());
// It is a helepr function which read and fill our template
const getFilledTemplate = (filePath, req, res, error) =>
  fs.readFile(filePath, 'utf8', (readFileError, data) =>
    readFileError ? undefined : Handlebars.compile(data)({ req, res, error }));

module.exports = (req, res, error) => {
  res.status(error.satus || 500);
  let output;

  // Check if we have a custom 505 error page
  if (isFile(custom505FilePath)) {
    // If we do have a custom 505 page, use it
    output = getFilledTemplate(custom505FilePath, req, res, error);
    // If we don't have a custom 505 error page but have gluestick error page
    // we use gluestick one
  } else if (isFile(gluestick505FilePath)) {
    output = getFilledTemplate(gluestick505FilePath, req, res, error);
  }
  // If we have filled template, render it
  if (output) {
    res.send(output);
    return;
  }
  // If we don't have a custom 505 error page then just throw the stack trace
  res.sendStatus(501);
};
