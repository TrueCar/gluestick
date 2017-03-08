/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default {
  postServerRun: [],
  preRenderFromCache: [],
  postRenderRequirements: [],
  preRedirect: [],
  postRenderProps: [],
  postGetCurrentRoute: [],
  postRender: [],
  error: [],
};
`;
