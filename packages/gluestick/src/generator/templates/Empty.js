/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
   this file exists so npm will include the empty folder
  `;
  return template;
};
