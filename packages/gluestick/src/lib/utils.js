module.exports = {
  requireWithInterop: (name: string): any => {
    const unknownModule = require(name);
    console.log('unknownModule', unknownModule);
    return Object.keys(unknownModule).length > 0 && unknownModule.default
      ? unknownModule.default
      : unknownModule;
  },
};
