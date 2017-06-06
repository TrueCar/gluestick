/* @flow */
import type { CreateTemplate } from '../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
{
  "presets": [
    "react",
    "es2015",
    "stage-0"
  ]
}
`;
