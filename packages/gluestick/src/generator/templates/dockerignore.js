/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    node_modules #required for gluestick dockerizing, DO NOT REMOVE
    .git
    .gitignore
  `;
  return template;
};

