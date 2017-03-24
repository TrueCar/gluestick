require('babel-polyfill');
require('babel-core/register')({
  ignore: /node_modules\/(?!gluestick.*)/,
  presets: [
    require.resolve('babel-preset-react'),
    require.resolve('babel-preset-es2015'),
    require.resolve('babel-preset-stage-0'),
  ],
  plugins: [
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ],
  babelrc: false,
});

