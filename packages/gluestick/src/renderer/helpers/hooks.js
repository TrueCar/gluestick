/* @flow */
import type { ServerPlugin } from '../../types';

module.exports = {
  // by making hooks static, we don't need to do any null checks on call
  // this can be refactored out
  call: (hooks: ?(Function | Function[]), arg?: any): any => {
    if (hooks) {
      return Array.isArray(hooks)
        ? hooks.reduce((val, hook) => hook(val), arg)
        : hooks(arg);
    }
    return arg;
  },
  // should be done once on import of hooks! this way we won't even
  // interact with raw gluestick-hooks import directly
  merge: (projectHooks: Object, plugins: ServerPlugin[]): Object => {
    const mergedHooks = plugins
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
  },
};
