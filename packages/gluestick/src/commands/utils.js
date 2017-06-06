/* @flow */

import type { GSConfig } from '../types';

const rimraf = require('rimraf');
const path = require('path');

module.exports = {
  filterArg: (args: string[], argsToExclude: string[]): string[] => {
    return args.filter(arg => !argsToExclude.includes(arg));
  },
  clearBuildDirectory: (gluestickConfig: GSConfig, buildType: string): void => {
    switch (buildType) {
      case 'server':
        rimraf.sync(
          path.join(process.cwd(), gluestickConfig.buildRendererPath, '*'),
        );
        break;
      case 'client':
        rimraf.sync(
          path.join(process.cwd(), gluestickConfig.buildAssetsPath, '!(dlls)'),
        );
        break;
      case 'static':
        rimraf.sync(
          path.join(process.cwd(), gluestickConfig.buildStaticPath, '*'),
        );
        break;
      case 'dlls':
        rimraf.sync(
          path.join(process.cwd(), gluestickConfig.buildDllPath, '*'),
        );
        break;
      default:
        throw new Error(`Invalid build type ${buildType}`);
    }
  },
};
