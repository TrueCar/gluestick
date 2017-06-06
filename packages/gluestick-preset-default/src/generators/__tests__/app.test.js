/* @flow */
[
  '../../templates/Index',
  '../../templates/empty',
  '../../templates/HomeCss.js',
  '../../templates/routes',
  '../../templates/reducersIndex',
].forEach(filename => jest.mock(filename, () => () => {}));
[
  '../../templates/Home',
  '../../templates/MasterLayout',
  '../../templates/HomeApp',
  '../../templates/NoMatchApp',
].forEach(filename => jest.mock(filename, () => ({ source: () => {}, test: () => {} })));
const appGenerator = require('../app');

const mockFlowConfig = (mapper = '') => `
[ignore]
# fbjs lib problems
.*/node_modules/fbjs/.*

[include]

[libs]
flow/
flow-typed/

[options]
suppress_comment=\\(.\\|\n\\)*\\$FlowFixMe
suppress_comment=\\(.\\|\n\\)*\\$FlowIgnore

module.ignore_non_literal_requires=true

module.name_mapper='^src/\\(.*\\)'->'<PROJECT_ROOT>/src/\\1'
${mapper}

[version]
^0.38.0
`;

const utils = {
  ...require('gluestick/build/utils'),
  createTemplate: v => v,
};

describe('generator/predefined/app', () => {
  it('should modify flowconfig', () => {
    const modifier: Function = appGenerator(utils)({ name: 'appName' }).modify[1].modifier;
    expect(modifier(mockFlowConfig())).toEqual(mockFlowConfig(
      'module.name_mapper=\'^appName/\\(.*\\)\'->\'<PROJECT_ROOT>/src/apps/app-name/\\1\'\n\n',
    ));
  });

  it('should not modify flowconfig', () => {
    const modifier: Function = appGenerator(utils)({ name: 'appName' }).modify[1].modifier;
    expect(modifier(mockFlowConfig(
      'module.name_mapper=\'^appName/\\(.*\\)\'->\'<PROJECT_ROOT>/src/apps/app-name/\\1\'',
    ))).toEqual(mockFlowConfig(
      'module.name_mapper=\'^appName/\\(.*\\)\'->\'<PROJECT_ROOT>/src/apps/app-name/\\1\'',
    ));
  });

  it('should throw error', () => {
    const modifier: Function = appGenerator(utils)({ name: 'appName' }).modify[1].modifier;
    expect(() => {
      modifier();
    }).toThrowError('Generating new app without bootstraped project');
  });

  it('should modify entries.json', () => {
    const modifier: Function = appGenerator(utils)({ name: 'appName' }).modify[0].modifier;
    expect(modifier('{}')).toEqual(JSON.stringify({
      '/app-name': {
        name: 'appName',
        component: 'src/apps/appName/Index.js',
        routes: 'src/apps/appName/routes.js',
        reducers: 'src/apps/appName/reducers',
      },
    }, null, '  '));
  });
});
