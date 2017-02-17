/* @flow */
import type { Response, Request, Context } from '../../types';

const fs = require('fs');
const Handlebars = require('handlebars');
// We use handlebars to deliver the 505 page. This lets you
// use a handlebars template so you can display the stack trace or
// any request, response information you would like.
Handlebars.registerHelper('notForProduction', (options) => {
  return process.env.NODE_ENV === 'production' ? '' : options.fn(this);
});

const tryReadFile = (filePath: string): Promise<string | boolean> =>
  new Promise((resolve, reject) => {
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') resolve(false);
        reject(error);
      }
      resolve(data);
    });
  });


module.exports = async (
  { config, logger }: Context,
  req: Request,
  res: Response,
  error: { status?: number },
): Promise<void> => {
  res.status(error.status || 500);
  try {
    // $FlowFixMe
    const customTemplate = await tryReadFile(config.GSConfig.customErrorTemplatePath);
    // $FlowFixMe
    const output = customTemplate || await tryReadFile(config.GSConfig.defaultErrorTemplatePath);
    if (output) {
      res.send(Handlebars.compile(output)({ req, res, error }));
    } else {
      res.sendStatus(501);
    }
  } catch (err) {
    res.sendStatus(500);
  }
};
