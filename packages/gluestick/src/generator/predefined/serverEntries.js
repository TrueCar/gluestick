const createTemplate = module.parent.createTemplate;

const template = createTemplate`
${args => args.entries.reduce((prev, curr) => {
  const entryImports = `import ${curr.name}Entry from '${curr.component}';\n`
    + `import ${curr.name}Routes from '${curr.routes}';\n`
    + `import ${curr.name}Reducers from '${curr.reducers}';\n`;
  return prev.concat(entryImports);
}, '')}

export default {
${args => args.entries.reduce((prev, curr) => {
  const entryDefinition = `  '${curr.path}': {\n`
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
    },
    entry: {
      path: options.serverEntriesPath,
      filename: `${options.name}.js`,
      template,
      overwrite: true,
    },
  };
};
