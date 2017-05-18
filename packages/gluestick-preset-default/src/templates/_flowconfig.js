/* @flow */

import type { CreateTemplate } from '../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
[ignore]
# fbjs lib problems
.*/node_modules/fbjs/.*
# radium lib problems
.*/node_modules/radium/.*

[include]

[libs]
flow/
flow-typed/

[options]
suppress_comment=\\\\(.\\\\|\\n\\\\)*\\\\$FlowFixMe
suppress_comment=\\\\(.\\\\|\\n\\\\)*\\\\$FlowIgnore

module.ignore_non_literal_requires=true

${(args) => Object.entries(args.mapper).reduce((prev, [key, value]) => {
  // $FlowFixMe check problems with Object.entries
  const curr = `module.name_mapper='^${key}/\\(.*\\)'->'<PROJECT_ROOT>${value}/\\1'\n`;
  return prev.concat(curr);
}, '')}
[version]
^${(args) => args.version}
`;
