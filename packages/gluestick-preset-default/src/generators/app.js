/* @flow */
import type { PredefinedGeneratorOptions, GeneratorUtils } from '../types';

const templateIndex = require('../templates/Index');
const templateEmpty = require('../templates/empty');
const templateHomeCss = require('../templates/HomeCss.js');
const templateRoutes = require('../templates/routes');
const templateHome = require('../templates/Home');

const templateMasterLayout = require('../templates/MasterLayout');
const templateHomeApp = require('../templates/HomeApp');
const templateNoMatchApp = require('../templates/NoMatchApp');
const templateReducer = require('../templates/reducersIndex');

module.exports = (
  { convertToCamelCase, convertToKebabCase, createTemplate }: GeneratorUtils,
) => (options: PredefinedGeneratorOptions) => {
  const appName = convertToKebabCase(options.name);
  return ({
    modify: [{
      file: 'src/entries.json',
      modifier: (content: string) => {
        const entries = content ? JSON.parse(content) : {};
        entries[`/${appName}`] = {
          name: convertToCamelCase(options.name),
          component: `src/apps/${options.name}/Index.js`,
          routes: `src/apps/${options.name}/routes.js`,
          reducers: `src/apps/${options.name}/reducers`,
        };
        return JSON.stringify(entries, null, '  ');
      },
    }, {
      file: '.flowconfig',
      modifier: (content: string): string => {
        if (!content) {
          throw new Error('Generating new app without bootstraped project');
        }
        const flowConfigLines: string[] = content.split('\n');
        const moduleMappers: string[] = flowConfigLines
          .filter(line => line.startsWith('module.name_mapper'));
        const newMapperRegex: RegExp = new RegExp(
          `module.name_mapper='\\^${convertToCamelCase(options.name)}`,
        );

        if (moduleMappers.findIndex(mapper => newMapperRegex.test(mapper)) === -1) {
          flowConfigLines.reverse();
          let added: boolean = false;
          const updatedFlowConfigLines: string[] = flowConfigLines
            .reduce((prev: string[], curr: string): string[] => {
              if (curr.startsWith('module.name_mapper') && !added) {
                added = true;
                return prev.concat([
                  `module.name_mapper='^${convertToCamelCase(options.name)}/\\(.*\\)'->`
                  + `'<PROJECT_ROOT>/src/apps/${appName}/\\1'\n`,
                  curr,
                ]);
              }
              return prev.concat(curr);
            }, []);
          return updatedFlowConfigLines.reverse().join('\n');
        }
        return content;
      },
    }],
    entries: [
      // Your new inner app
      {
        path: `src/apps/${options.name}`,
        filename: 'routes.js',
        template: templateRoutes(createTemplate),
        args: {
          index: appName,
        },
      },
      {
        path: `src/apps/${options.name}`,
        filename: 'Index.js',
        template: templateIndex(createTemplate),
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'Home.js',
        template: templateHome.source(createTemplate),
      },
      {
        path: `src/apps/${options.name}/components/__tests__`,
        filename: 'Home.test.js',
        template: templateHome.test(createTemplate),
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'Home.css',
        template: templateHomeCss(createTemplate),
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'MasterLayout.js',
        template: templateMasterLayout.source(createTemplate),
      },
      {
        path: `src/apps/${options.name}/components/__tests__`,
        filename: 'MasterLayout.test.js',
        template: templateMasterLayout.test(createTemplate),
      },
      {
        path: `src/apps/${options.name}/containers`,
        filename: 'HomeApp.js',
        template: templateHomeApp.source(createTemplate),
      },
      {
        path: `src/apps/${options.name}/containers/__tests__`,
        filename: 'HomeApp.test.js',
        template: templateHomeApp.test(createTemplate),
      },
      {
        path: `src/apps/${options.name}/containers`,
        filename: 'NoMatchApp.js',
        template: templateNoMatchApp.source(createTemplate),
      },
      {
        path: `src/apps/${options.name}/containers/__tests__`,
        filename: 'NoMatchApp.test.js',
        template: templateNoMatchApp.test(createTemplate),
      },
      {
        path: `src/apps/${options.name}/actions`,
        filename: '.gitkeep',
        template: templateEmpty(createTemplate),
      },
      {
        path: `src/apps/${options.name}/actions/__tests__`,
        filename: '.gitkeep',
        template: templateEmpty(createTemplate),
      },
      {
        path: `src/apps/${options.name}/reducers`,
        filename: 'index.js',
        template: templateReducer(createTemplate),
      },
      {
        path: `src/apps/${options.name}/reducers/__tests__`,
        filename: '.gitkeep',
        template: templateEmpty(createTemplate),
      },
    ],
  });
};
