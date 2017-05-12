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
in `src/gluestick.plugins.js` file, instead of providing just plugin name,
provide object matching the following schema:
```
{
  plugin: string; // plugin name
  options: { // configuration for plugin
    ...
  }
}
```
for example:
```
{
  plugin: 'gluestick-env-expose-ast',
  options: {
    parse: 'file.js',
  },
}
```

When running commands that uses plugins eg. `start`, `start-client`, `start-server`, `build`
you should see logs stating witch plugins were compiled.

If compilation of some plugin fail, appropriate error message will be show,
however other plugins will still be compiled, and execution of command will
continue.

## Avaiable plugins
- [`gluestick-env-expose-ast`](../packages/gluestick-env-expose-ast/README.md)
- [`gluestick-config-legacy`](../packages/gluestick-config-legacy/README.md)
- [`gluestick-plugin-aphrodite`](../packages/gluestick-plugin-aphrodite/README.md)
- [`gluestick-plugin-radium`](../packages/gluestick-plugin-radium/README.md)
- [`gluestick-plugin-bunyan`](../packages/gluestick-plugin-bunyan/README.md)

# How to write a plugin
First of all, there are 3 types of plugins:
- `config` - modifies gluestick and webpack configs, both server and client one
- `runtime` - bundled into JavaScript bundles and executed when final output is being
rendered
- `server` - bundled into renderer (server) bundle and executed when renderer starts

Plugin must implement at least one type, but they can have multiple types specified.
To implement a type, you must create a file in top level of plugin directory and name
it: `<type>.js` so it can be: `config.js`, `runtime.js`, `server.js`.

__IMPORTANT__: GlueStick won't transpile your plugin, thus it's up to you to transpile it using for instance `babel` or `typescipt`.

## Config plugin
Must export function that returns object will overwriters.
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
Exported function is a factory for two groups of overwrites: `preOverwrites` and `postOverwrites`.
This factory function accepts options that are defined in plugins declaration file inside project,
by default `src/gluestick.plugins.js`. Second argument is an object with utilities provided by
gluestick, currently the only one is logger, that you can use to print messages using:
- `logger.debug(...args)`
- `logger.info(...args)`
- `logger.success(...args)`
- `logger.warn(...args)`
- `logger.error(...args)`

`preOverwrites` are executed before specific configs are prepared. This is the place for modification
that should be considered by universal-webpack, for example aliases, which can define if file
from import is external or not.
- `sharedWebpackConfig: config => config` - accepts shared webpack config and
must return valid webpack config which will be the base for both by client and server configs

`postOverwrites` are executed after every config is prepared, so modifications to configs will
go directly to webpack compiler. Modification done here won't be taken into considiration by
uniwersal-webpack. This is the place for isomorphic-like things.
- `gluestickConfig: config => config` - accepts gluestick config and must return the same
valid gluestick config with modified values
- `clientWebpackConfig: config => config` - accepts client webpack config and
must return valid webpack config for client bundle
- `serverWebpackConfig: config => config` - accepts server webpack config and
must return valid webpack config for renderer (server) bundle

## Server plugin
Server plugins similarly to config plugins, must export factory function, that
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
or with `hooks` object that contains any of [these hooks](./CachingAndHooks.md).

By default gluestick will try to get name of the plugin from `meta` property set on exported factory
function, then from factory function name property. If it does not find any name, it will use
`unknown`. It's recommended to set `name` of plugin in `meta` property, so when
calling `gluestick start` or `gluestick start-server` it will print your plugin name,
along with other compiled plugins. `name` property also will be used when there is an
error in plugin implementation to create helpful, user friendly message.

`renderMethod` is usefull for supplying custom function to use when rendering app on server.
It only accepts one argument with react root component to render and must return an object
with `body` property with actual string that will be send to browser, `head` array with React
elements that will be injected into `<head>` of document nad optionally `additionalScript`,
which also is a array of React `<script>` elements to inject to document.

## Runtime plugns
Runtime plugins are a little bit different, since they don't export factory
function but must return object with 2 properties:
- `meta` - object with meta information, you must specifiy if plugin is a `rootWrapper` or a `hook`.
You must provida exactly one flag in `meta` object:
```
const meta = { rootWrapper: true };
```
or
```
const meta = { hook: true };
```
- `plugin` - function with plugin implementation

Depending on what flag is set, `plugin` function will look slightly different:
- if `rootWrapper` is `true`:
```
const plugin = (component, rootWrapperOptions) => component;
```
where `component` is a root app component, `rootWrapperOptions` is an object, which currently
has only one property - `userAgent` which is equivalent of `window.navigator.userAgent` (client) or
`user-agent` header from request (server). In this case `plugin` function must return a valid
React component. Typically `component` argument will be wrapped with some other component.
- if `hook` is `true`, `plugin` will be a argument-less function which returned value will be
discard.

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
