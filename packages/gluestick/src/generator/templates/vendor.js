/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
// Import common modules or libraries here.
// If you want to have them as a DLL bundle, run 'gluestick build --vendor',
// otherwise it will be used as a normal bundle by CommonsChunkPlugin.
`;
