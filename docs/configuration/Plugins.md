# Plugins
Plugins are shipped as separate packages and can extend or modify gluestick or webpack behaviour.

## How to use
1. Install plugin:
```
npm install --save gluestick-config-legacy
```
2. Add plugin to `src/gluestick.plugins.js`:
```
export default [
  'gluestick-config-legacy'
];
```

## Plugin configuration
You can pass additional configuration options to plugin. To do so,
in the `src/gluestick.plugins.js` file, instead of providing just the plugin name,
provide an object matching the following schema:
```javascript
{
  plugin: string; // plugin name
  options: { // configuration for plugin
    ...
  }
}
```
for example:
```javascript
{
  plugin: 'gluestick-env-expose-ast',
  options: {
    parse: 'file.js',
  },
}
```

When running a command that uses plugins eg. `start`, `start-client`, `start-server`, `build`
you should see logs stating which plugins were compiled.

If the compilation of a plugin fails, an appropriate error message will be show,
however other plugins will still be compiled, and execution of the command will
continue.

## Avaiable plugins
- [`gluestick-env-expose-ast`](../../packages/gluestick-env-expose-ast/README.md)
- [`gluestick-config-legacy`](../../packages/gluestick-config-legacy/README.md)
- [`gluestick-plugin-aphrodite`](../../packages/gluestick-plugin-aphrodite/README.md)
- [`gluestick-plugin-radium`](../../packages/gluestick-plugin-radium/README.md)
- [`gluestick-plugin-bunyan`](../../packages/gluestick-plugin-bunyan/README.md)

# How to write a plugin
First of all, there are 3 types of plugins:
- `config` - modifies gluestick and webpack configs,for both server and client
- `runtime` - bundled into JavaScript bundles and executed when final output is being
rendered
- `server` - bundled into renderer (server) bundle and executed when renderer starts

A plugin must implement at least one type, but can have multiple types specified.
To implement a type, you must create a file in the top level of the plugin directory and name
it: `<type>.js` so it can be: `config.js`, `runtime.js`, `server.js`.

__IMPORTANT__: GlueStick won't transpile your plugin, thus it's up to you to transpile it using, for instance, `babel` or `typescript`.

## Config plugin
Must export a function that returns an object with `preOverwrites` and/or `postOverwrites`.
```
module.exports = (options, { logger }) => {
  return {
    preOverwrites: {
      sharedWebpackConfig: config => config,
    },
    postOverwrites: {
      gluestickConfig: config => config,
      clientWebpackConfig: config => config,
      serverWebpackConfig: config => config,
    },
  };
};
```
The exported function is a factory for two groups of overwrites: `preOverwrites` and `postOverwrites`.
This factory function accepts options that are defined in the plugins declaration file inside the project,
by default `src/gluestick.plugins.js`. The second argument is an object with utilities provided by
gluestick:
- `logger` - logger instance
  - `logger.debug(...args)`
  - `logger.info(...args)`
  - `logger.success(...args)`
  - `logger.warn(...args)`
  - `logger.error(...args)`
- `requireModule` - safe require function, which will transform the module with babel (`es2015`, `stage-0`, `transform-flow-strip-types`) then noralizes module with `getDefaultExport`
- `requireWithInterop` - require and normalize module using `getDefaultExport`
- `getDefaultExport` - normalize CJS and ESM exported value

`preOverwrites` are executed before specific configs are prepared. This is the place for modification
that should be considered by universal-webpack, for example aliases, which can define if file
from import is external or not.
- `sharedWebpackConfig: config => config` - accepts a shared webpack config and
must return a valid webpack config which will be the base for both the client and server configs

`postOverwrites` are executed after every config is prepared, so modifications to configs will
go directly to webpack compiler. Modification done here won't be taken into considiration by
uniwersal-webpack. This is the place for isomorphic-like things.
- `gluestickConfig: config => config` - accepts gluestick config and must return the same
valid gluestick config with modified values
- `clientWebpackConfig: config => config` - accepts the client webpack config and
must return a valid webpack config for client bundle
- `serverWebpackConfig: config => config` - accepts the server webpack config and
must return a valid webpack config for the renderer (server) bundle

## Server plugin
Server plugins, similarly to config plugins, must export a factory function, that
accept options and gluestick utils.
```
module.exports = (options, { logger }) => ({
  renderMethod: (root) => ({
    body: '...',
    head: [],
    additionalScript: []
  }),
  hooks: {}
});

module.exports.meta = { name: 'gluestick-plugin-myplugin' };
```
This factory function must return object with implementation of `renderMethod`
or with a `hooks` object that contains any of [these hooks](./CachingAndHooks.md).

By default, gluestick will try to get name of the plugin from the `meta` property set on the exported factory
function, then from the factory function name property. If it does not find any name, it will use
`unknown`. It's recommended to set the `name` of the plugin in the `meta` property, so when
calling `gluestick start` or `gluestick start-server` it will print your plugin name,
along with other compiled plugins. The `name` property will also be used when there is an
error in plugin implementation to create a helpful, user friendly message.

`renderMethod` is useful for supplying a custom function to use when rendering the app on the server.
It only accepts one argument with the react root component to render and must return an object
with a `body` property with the actual string that will be sent to the browser, `head` array with React
elements that will be injected into the `<head>` of the document and optionally `additionalScript`,
which also is an array of React `<script>` elements to inject into the document.

## Runtime plugns
Runtime plugins are a little bit different, since they don't export factory a
function, but must return an object with 2 properties:
- `meta` - an object with meta information, you must specifiy if the plugin is a `rootWrapper` or a `hook`.
You must provida exactly one flag in the `meta` object:
```
const meta = { rootWrapper: true };
```
or
```
const meta = { hook: true };
```
- `plugin` - a function with plugin implementation

Depending on what flag is set, the `plugin` function will look slightly different:
- if `rootWrapper` is `true`:
```
const plugin = (component, rootWrapperOptions) => component;
```
where `component` is a root app component, `rootWrapperOptions` is an object, which currently
has only one property - `userAgent` which is equivalent of `window.navigator.userAgent` (client) or
`user-agent` header from request (server). In this case the `plugin` function must return a valid
React component. Typically the `component` argument will be wrapped with some other component.
- if `hook` is `true`, `plugin` will be an argument-less function of which the returned value will be
discarded.

Example:
```
import React from 'react';
import SomeRoot from 'some-lib';

export default {
  meta: { rootWrapper: true },
  plugin: (component, rootWrapperOptions) => {
    return (
      <SomeRoot userAgent={rootWrapperOptions.userAgent}>
        {component}
      </SomeRoot>
    );
  },
};

```
