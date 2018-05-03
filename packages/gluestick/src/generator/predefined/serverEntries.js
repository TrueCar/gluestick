const createTemplate = module.parent.createTemplate;
const { convertToCamelCase } = require('../../utils');

const getPluginName = (name, type) => {
  return convertToCamelCase(
    `${name}${type[0].toUpperCase()}${type.substring(1)}`,
  );
};

const template = createTemplate`
${args =>
  args.entries.reduce((prev, curr) => {
    const entryImports =
      `import ${curr.name}Entry from "${curr.component}";\n` +
      `import ${curr.name}Routes from "${curr.routes}";\n` +
      `import ${curr.name}Reducers from "${curr.reducers}";\n` +
      `${curr.config
        ? `import ${curr.name}Config from "${curr.config}";\n`
        : ''}`;
    return prev.concat(entryImports);
  }, '')}

${args =>
  args.plugins.reduce((prev, curr) => {
    const info = '// Workaround for external modules not being compiled\n';
    const pluginImport =
      `import ${getPluginName(curr.name, curr.meta.type)} ` +
      `from "${curr.name}/build/${curr.meta.type}";\n`;
    return prev.concat(info, pluginImport);
  }, '')}

export const plugins = [
  ${args =>
    args.plugins.reduce((prev, curr, index) => {
      return prev.concat(
        `${index > 0 ? '  ' : ''}` +
          `{
          body: typeof ${getPluginName(
            curr.name,
            curr.meta.type,
          )} === "function" ? ${getPluginName(
            curr.name,
            curr.meta.type,
          )} : ${getPluginName(curr.name, curr.meta.type)}.plugin,
          meta: ${JSON.stringify(curr.meta)},
          options: ${JSON.stringify(curr.options)}
          },
          `,
      );
    }, '')}
];

export default {
${args =>
  args.entries.reduce((prev, curr) => {
    const entryDefinition =
      `  "${curr.path}": {\n` +
      `${curr.explicitName ? `    name: '${curr.explicitName}',\n` : ''}` +
      `    component: ${curr.name}Entry,\n` +
      `    routes: ${curr.name}Routes,\n` +
      `    reducers: ${curr.name}Reducers,\n` +
      `${curr.config ? `    config: ${curr.name}Config,\n` : ''}` +
      '  },\n';
    return prev.concat(entryDefinition);
  }, '')}
};
`;

module.exports = options => {
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
