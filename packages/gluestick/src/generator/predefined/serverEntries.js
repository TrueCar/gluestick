const createTemplate = module.parent.createTemplate;
const { convertToCamelCase } = require('../utils');

const template = createTemplate`
${args => args.entries.reduce((prev, curr) => {
  const entryImports = `import ${curr.name}Entry from '${curr.component}';\n`
    + `import ${curr.name}Routes from '${curr.routes}';\n`
    + `import ${curr.name}Reducers from '${curr.reducers}';\n`;
  return prev.concat(entryImports);
}, '')}

${args => args.plugins.reduce((prev, curr) => {
  const pluginImport = `import ${convertToCamelCase(curr.plugin)} from '${curr.plugin}';\n`;
  return prev.concat(pluginImport);
}, '')}

export const plugins = [
  ${args => args.plugins.reduce((prev, curr, index, arr) => {
    console.log('ARR', arr, 'INDEX', index);
    return prev.concat(
      `${index > 0 ? '  ' : ''}`
      + `${convertToCamelCase(curr.plugin)},`
      + `${arr.length - 1 !== index ? '\n' : ''}`,
    );
  }, '')}
];

export default {
${args => args.entries.reduce((prev, curr) => {
  const entryDefinition = `  '${curr.path}': {\n`
    + `${curr.explicitName ? `    name: '${curr.explicitName}',\n` : ''}`
    + `    component: ${curr.name}Entry,\n`
    + `    routes: ${curr.name}Routes,\n`
    + `    reducers: ${curr.name}Reducers,\n`
    + '  },\n';
  return prev.concat(entryDefinition);
}, '')}
};
`;

module.exports = (options) => {
  return {
    args: {
      entries: options.entries,
      plugins: options.plugins,
    },
    entry: {
      path: options.serverEntriesPath,
      filename: `${options.name}.js`,
      template,
      overwrite: true,
    },
  };
};
