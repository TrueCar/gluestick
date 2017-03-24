/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

// Code in this file will be executed when the app has loaded in the browser
// but before calling the React render method. This is a good place to do
// things like mount global error handlers or any other setup that needs to
// happen before the app is rendered.
`;
