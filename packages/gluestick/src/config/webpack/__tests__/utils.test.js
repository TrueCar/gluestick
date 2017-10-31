/* @flow */
const { updateBabelLoaderConfig } = require('../utils');

describe('config/webpack/utils', () => {
  it('should modify babel loader config', () => {
    const config = {
      module: {
        rules: [
          {
            test: /abc/,
          },
          {
            test: /\.js$/,
            use: [
              {
                loader: 'test',
              },
              {
                loader: 'babel-loader',
                options: {
                  plugins: [],
                  presets: ['es2015'],
                },
              },
            ],
          },
        ],
      },
    };
    updateBabelLoaderConfig(config, opts => {
      return {
        ...opts,
        presets: [...opts.presets, 'react'],
      };
    });
    expect(config.module.rules).toEqual([
      {
        test: /abc/,
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'test',
          },
          {
            loader: 'babel-loader',
            options: {
              plugins: [],
              presets: ['es2015', 'react'],
            },
          },
        ],
      },
    ]);
  });
});
