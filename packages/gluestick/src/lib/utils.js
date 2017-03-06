module.exports = {
  requireWithInterop: (name: string): any => {
    // TODO: improve it
    const unknownModule = require(name);
    return Object.keys(unknownModule).length > 0 && unknownModule.default
      ? unknownModule.default
      : unknownModule;
  },
};
