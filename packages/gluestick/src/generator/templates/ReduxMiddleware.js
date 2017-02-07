/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    // Gluestick has already included thunk and a custom Promise middleware; any
    // middleware added here will be added after those.
    //
    // Example:
    // import createLogger from 'redux-logger';
    // const logger = createLogger();
    // export default [logger];
    export default [];
  `;
  return template;
};
