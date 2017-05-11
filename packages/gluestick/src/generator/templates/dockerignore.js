/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
node_modules
.git
.gitignore
`;
