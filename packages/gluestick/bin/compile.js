require('babel-polyfill');
require('babel-core/register')({
  only: /gluestick.*/,
  ignore: /(webpack|build).*/,
  presets: [
    require.resolve('babel-preset-react'),
    require.resolve('babel-preset-es2015'),
    require.resolve('babel-preset-stage-0'),
  ],
  plugins: [
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-flow-strip-types'),
  ],
});

