const path = require('path');

const getGeneratorPath = (name: string): string => {
  const preset: string = `gluestick-preset-${
    require(path.join(process.cwd(), 'package.json')).preset || 'default'
  }`;
  return `${preset}/build/generators/${name}`;
};

module.exports = {
  getGeneratorPath,
};
