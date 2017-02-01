require('babel-polyfill');
require('babel-core/register')({
  only: /gluestick.*/,
  presets: [
    'react',
    'es2015',
    'stage-0',
  ],
  plugins: [
    'transform-decorators-legacy',
  ],
});

