/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default {
  webpackClientConfig: [],
  webpackServerConfig: [],
  webpackVendorDllConfig: [],
};
`;
