/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
node_modules #required for gluestick dockerizing, DO NOT REMOVE
.git
.gitignore
`;
