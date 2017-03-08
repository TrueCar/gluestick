/* @flow */
import type { CreateTemplate } from '../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
{
  "/": {
    "component": "src/apps/main/Index.js",
    "routes": "src/apps/main/routes.js",
    "reducers": "src/apps/main/reducers"
  }
}
`;
