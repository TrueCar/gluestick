/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const dependenciesToJson = dependencies => (acc, key, index, array) => {
  return acc.concat(
    `"${key}": "${dependencies[key]}"${index === array.length - 1 ? '' : ',\n    '}`,
  );
};

const templatePackage = createTemplate`
{
  "name": "${args => args.appName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "preset": "${args => args.preset}",
  "scripts": {
    "start": "gluestick start",
    "test": "gluestick test",
    "flow": "flow",
    "lint": "eslint src"
  },
  "dependencies": {
    ${args => Object.keys(args.dependencies).reduce(dependenciesToJson(args.dependencies), '')}
  },
  "devDependencies": {
    ${args => Object.keys(args.devDependencies).reduce(dependenciesToJson(args.devDependencies), '')}
  },
  "author": "",
  "license": "ISC"
}
`;

const reverseGluestickDependencies = dependencies => {
  return Object.keys(dependencies).reverse().reduce((acc, key) => {
    return { ...acc, [key]: dependencies[key] };
  }, {});
};

module.exports = ({ appName, preset, gluestickDependencies, presetDependencies }) => ({
  entries: [
    {
      path: '/',
      filename: 'package.json',
      template: templatePackage,
      args: {
        appName,
        preset,
        dependencies: {
          ...reverseGluestickDependencies(gluestickDependencies),
          ...presetDependencies.dependencies,
        },
        devDependencies: presetDependencies.devDependencies,
      },
    },
  ],
});
