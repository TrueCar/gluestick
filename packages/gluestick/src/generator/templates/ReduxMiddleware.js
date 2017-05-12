/* @flow */

import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

// Gluestick has already included thunk and a custom Promise middleware; any
// middleware added here will be added after those.
//
// Example:
// import createLogger from 'redux-logger';
// const logger = createLogger();
// export default [logger];
export default [];
export const thunkMiddleware = null;
`;
