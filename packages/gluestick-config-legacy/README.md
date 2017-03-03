# `gluestick-config-legacy`
This plugin allows to specify additional webpack loaders, plugins, aliases and redux middlewares.

Webpack additions can be defined in `src/config/webpack-additions.js`.

Redux middlewares can be defined in `src/config/redux-middleware.js`.

## How to use
1. Install plugin
```
npm install --save gluestick-config-legacy`
```
2. Define (and configure) plugin in `src/gluestick.plugins.js`:
```
export default [
  'gluestick-config-legacy'
]
```

## Configuration
This plugin doesn't accept any configuration options.
