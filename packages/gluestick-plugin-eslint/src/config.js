const path = require('path');
const fs = require('fs');

class ReorderLintWarningsPlugin {
  constructor() {

  }

  apply(compiler) {
    compiler.plugin('after-compile', (compilation, callback) => {
      compilation.warnings.sort((w1, w2) => {
        if (!w1._lastModifiedDate) {
          w1._lastModifiedDate = fs.statSync(w1.module.resource).mtime;
        }
        if (!w2._lastModifiedDate) {
          w2._lastModifiedDate = fs.statSync(w2.module.resource).mtime;
        }
        return w1._lastModifiedDate < w2._lastModifiedDate ? 1 : -1;
      });

      callback();
    });
  }
}

const clientWebpackConfig = ({ loaderOptions }) => config => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          {
            enforce: 'pre',
            test: /\.js$/,
            exclude: /node_modules|gluestick/,
            loader: 'eslint-loader',
            options: {
              ...loaderOptions,
              configFile: path.join(process.cwd(), '.eslintrc'),
            },
          },
          ...config.module.rules,
        ],
      },
      plugins: [
        ...config.plugins,
        new ReorderLintWarningsPlugin(),
      ],
    };
  }
  return config;
};

module.exports = (options = {}) => ({
  postOverwrites: {
    clientWebpackConfig: clientWebpackConfig(options),
  },
});
