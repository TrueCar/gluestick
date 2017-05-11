/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default {
  webpackClientConfig: [],
  webpackServerConfig: [],
};
`;
