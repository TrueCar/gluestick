/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
export default {
  protocol: "http",
  host: "0.0.0.0",
  port: 8888,
  ssetPort: 8880
};
`;
