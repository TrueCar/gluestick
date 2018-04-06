// @flow
const callHook = (hooks: ?(Function | Function[]), arg?: any): any => {
  if (hooks) {
    return Array.isArray(hooks)
      ? hooks.reduce((val, hook) => hook(val), arg)
      : hooks(arg);
  }
  return arg;
};

module.exports = callHook;
