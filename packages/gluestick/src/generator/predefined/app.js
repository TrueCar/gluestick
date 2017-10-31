/* @flow */
import type { GeneratorOptions } from '../../types';

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templateIndex = require('../templates/Index')(createTemplate);
const templateHomeTest = require('../templates/HomeTest')(createTemplate);
const templateMasterLayoutTest = require('../templates/MasterLayoutTest')(
  createTemplate,
);
const templateContainerHomeTest = require('../templates/ContainerHomeTest')(
  createTemplate,
);
const templateNoMatchAppTest = require('../templates/NoMatchAppTest')(
  createTemplate,
);
const templateEmpty = require('../templates/Empty')(createTemplate);
const templateHome = require('../templates/Home')(createTemplate);
const templateHomeCss = require('../templates/HomeCss.js')(createTemplate);
const templateMasterLayout = require('../templates/MasterLayout')(
  createTemplate,
);
const templateRoutes = require('../templates/Routes')(createTemplate);
const templateHomeApp = require('../templates/HomeApp')(createTemplate);
const templateNoMatchApp = require('../templates/NoMatchApp')(createTemplate);
const templateReducer = require('../templates/Reducer')(createTemplate);
const { convertToCamelCase, convertToKebabCase } = require('../../utils');

module.exports = (options: GeneratorOptions) => {
  const appName = convertToKebabCase(options.name);
  return {
    modify: [
      {
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
      },
      {
        file: '.flowconfig',
        modifier: (content: string): string => {
          if (!content) {
            throw new Error('Generating new app without bootstraped project');
          }
          const flowConfigLines: string[] = content.split('\n');
          const moduleMappers: string[] = flowConfigLines.filter(line =>
            line.startsWith('module.name_mapper'),
          );
          const newMapperRegex: RegExp = new RegExp(
            `module.name_mapper='\\^${convertToCamelCase(options.name)}`,
          );

          if (
            moduleMappers.findIndex(mapper => newMapperRegex.test(mapper)) ===
            -1
          ) {
            flowConfigLines.reverse();
            let added: boolean = false;
            const updatedFlowConfigLines: string[] = flowConfigLines.reduce(
              (prev: string[], curr: string): string[] => {
                if (curr.startsWith('module.name_mapper') && !added) {
                  added = true;
                  return prev.concat([
                    `module.name_mapper='^${convertToCamelCase(
                      options.name,
                    )}/\\(.*\\)'->` +
                      `'<PROJECT_ROOT>/src/apps/${appName}/\\1'\n`,
                    curr,
                  ]);
                }
                return prev.concat(curr);
              },
              [],
            );
            return updatedFlowConfigLines.reverse().join('\n');
          }
          return content;
        },
      },
    ],
    entries: [
      // Your new inner app
      {
        path: `src/apps/${options.name}`,
        filename: 'routes.js',
        template: templateRoutes,
        args: {
          index: appName,
        },
      },
      {
        path: `src/apps/${options.name}`,
        filename: 'Index.js',
        template: templateIndex,
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'Home.js',
        template: templateHome,
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'Home.css',
        template: templateHomeCss,
      },
      {
        path: `src/apps/${options.name}/components`,
        filename: 'MasterLayout.js',
        template: templateMasterLayout,
      },
      {
        path: `src/apps/${options.name}/containers`,
        filename: 'HomeApp.js',
        template: templateHomeApp,
      },
      {
        path: `src/apps/${options.name}/containers`,
        filename: 'NoMatchApp.js',
        template: templateNoMatchApp,
      },
      {
        path: `src/apps/${options.name}/actions`,
        filename: '.gitkeep',
        template: templateEmpty,
      },
      {
        path: `src/apps/${options.name}/reducers`,
        filename: 'index.js',
        template: templateReducer,
      },
      {
        path: `src/apps/${options.name}/components/__tests__`,
        filename: 'Home.test.js',
        template: templateHomeTest,
      },
      {
        path: `src/apps/${options.name}/components/__tests__`,
        filename: 'MasterLayout.test.js',
        template: templateMasterLayoutTest,
      },
      {
        path: `src/apps/${options.name}/containers/__tests__`,
        filename: 'HomeApp.test.js',
        template: templateContainerHomeTest,
      },
      {
        path: `src/apps/${options.name}/containers/__tests__`,
        filename: 'NoMatchApp.test.js',
        template: templateNoMatchAppTest,
      },
      {
        path: `src/apps/${options.name}/reducers/__tests__`,
        filename: '.gitkeep',
        template: templateEmpty,
      },
      {
        path: `src/apps/${options.name}/actions/__tests__`,
        filename: '.gitkeep',
        template: templateEmpty,
      },
    ],
  };
};
