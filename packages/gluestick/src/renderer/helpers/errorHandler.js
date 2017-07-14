/* @flow */
import type { Response, Request, Context } from '../../types';

const fs = require('fs');
// We use handlebars to deliver the 500 page. This lets you
// use a handlebars template so you can display the stack trace or
// any request, response information you would like.
const Handlebars = require('handlebars');

const tryReadFile = (filePath: string): Promise<string | boolean> =>
  new Promise(
    (
      resolve: (value: string | boolean) => void,
      reject: (value: Object) => void,
    ): void => {
      fs.readFile(filePath, 'utf8', (error: any, data: string): void => {
        if (error) {
          if (error.code === 'ENOENT') resolve(false);
          reject(error);
        }
        resolve(data);
      });
    },
  );

module.exports = async (
  { config, logger }: Context,
  req: Request,
  res: Response,
  error: { status?: number },
): Promise<void> => {
  res.status(error.status || 500);
  try {
    const customTemplate = await tryReadFile(
      config.GSConfig.customErrorTemplatePath,
    );
    const output =
      customTemplate ||
      (await tryReadFile(config.GSConfig.defaultErrorTemplatePath));
    if (output) {
      res.send(
        Handlebars.compile(output)({
          showStack: process.env.NODE_ENV !== 'production',
          req,
          res,
          error,
        }),
      );
    } else {
      res.sendStatus(501);
    }
  } catch (err) {
    res.sendStatus(500);
  }
};
