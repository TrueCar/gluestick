/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default {
  expressApp: [],
  preRenderFromCache: [],
  postRenderRequirements: [],
  preRedirect: [],
  postRenderProps: [],
  postGetCurrentRoute: [],
  postRender: [],
  error: [],
};
`;
