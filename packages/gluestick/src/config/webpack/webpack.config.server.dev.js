const deepClone = obj => {
  const output = {};
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      output[key] = value.slice();
    } else {
      output[key] = (typeof value === 'object') ? deepClone(value) : value;
    }
  }
  return output;
};

module.exports = (serverConfig, devServerPort) => {
  const configuration = deepClone(serverConfig);
  configuration.output.publicPath = `http://localhost:${devServerPort}${
    configuration.output.publicPath}`;
  return configuration;
};
