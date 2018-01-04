/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
{
  "presets": [
    "react",
    ["es2015", { "modules": false }],
    "stage-0"
  ],
  "plugins": [
    "babel-plugin-transform-decorators-legacy",
    "babel-plugin-transform-flow-strip-types"
  ],
  "env": {
    "development": {
      "plugins": [
        "react-hot-loader/babel"
      ]
    }
  }
}
`;
