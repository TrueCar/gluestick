module.exports = (hooks, ...args) => {
  // Check if args i set
  if (hooks.constructor === Array) {
    hooks.forEach(hook => hook(...args));
  } else {
    hooks(...args);
  }
};
