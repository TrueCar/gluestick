/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    export default {
    protocol: "http",
    host: "0.0.0.0",
    port: 8888,
    ssetPort: 8880
  };
  `;
  return template;
};
