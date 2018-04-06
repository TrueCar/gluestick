/* @flow */
import type { GSHooks, ServerPlugin } from '../../types';

const projectHooks = require('gluestick-hooks').default;
const serverPlugins = require('../../plugins/serverPlugins');

export const callHook = (hooks: ?(Function | Function[]), arg?: any): any => {
  if (hooks) {
    return Array.isArray(hooks)
      ? hooks.reduce((val, hook) => hook(val), arg)
      : hooks(arg);
  }
  return arg;
};

const merge = (): GSHooks => {
  const mergedHooks = serverPlugins
    .filter((plugin: ServerPlugin): boolean => {
      return plugin.hooks && !!Object.keys(plugin.hooks).length;
    })
    .reduce((prev: Object, curr: ServerPlugin): Object => {
      const hooks = prev;
      Object.keys(curr.hooks).forEach(hookName => {
        if (Array.isArray(hooks[hookName])) {
          hooks[hookName] = hooks[hookName].concat(curr.hooks[hookName]);
        } else {
          hooks[hookName] = [].concat(curr.hooks[hookName]);
        }
      });
      return hooks;
    }, {});
  Object.keys(projectHooks).forEach((hookName: string) => {
    if (Array.isArray(mergedHooks[hookName])) {
      mergedHooks[hookName] = mergedHooks[hookName].concat(
        projectHooks[hookName],
      );
    } else {
      mergedHooks[hookName] = [].concat(projectHooks[hookName]);
    }
  });
  return mergedHooks;
};

const hooks = merge();

export default hooks;
