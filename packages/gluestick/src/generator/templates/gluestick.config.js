/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default config => ({
  ...config,
  publicPath: process.env.ASSET_URL || "/assets/",
});
`;
