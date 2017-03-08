/* @flow */
import type { GeneratorOptions } from '../types';

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templatePackage = require('../templates/package')(createTemplate);

const { flowVersion } = require('../constants');

module.exports = (options: GeneratorOptions) => ({
  entries: [
    {
      path: '/',
      filename: 'package.json',
      template: templatePackage,
      args: {
        dev: options.dev,
        appName: options.appName,
        flowVersion,
      },
    },
  ],
});
