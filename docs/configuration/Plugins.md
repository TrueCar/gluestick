# Plugins
Plugins are shipped as separate packages and can extend or modify gluestick or webpack behavior.

## How to use
1. Install plugin:
```bash
npm install --save gluestick-config-legacy
```
2. Add plugin to `src/gluestick.plugins.js`:
```js
export default [
  'gluestick-config-legacy'
];
```

## Plugin configuration
You can pass additional configuration options to plugin. To do so,
in `src/gluestick.plugins.js` file, instead of providing just plugin name,
provide object matching the following schema:
```js
{
  plugin: string; // plugin name
  options: { // configuration for plugin
    ...
  }
}
```
for example:
```js
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

__IMPORTANT__: GlueStick won't transpile your plugin, thus it's up to you to transpile it using for instance `babel` or `typescript`.

## Config plugin
Must export function that returns object with function to overwrite gluestick/client/server/vendor configs:

```js
module.exports = (options, { logger }) => {
  return {
    gluestick: config => config,
    client: config => config,
    server: config => config,
    vendor: config => config,
  };
};
```

This factory function accepts options that are defined in plugins declaration file inside project, by default `src/gluestick.plugins.js`. Second argument is an object with utilities provided by gluestick:
- `logger` - logger instance
  - `logger.debug(...args)`
  - `logger.info(...args)`
  - `logger.success(...args)`
  - `logger.warn(...args)`
  - `logger.error(...args)`
- `requireModule` - safe require function, which will transform module with babel (`es2015`, `stage-0`, `transform-flow-strip-types`) then normalizes module with `getDefaultExport`
- `requireWithInterop` - require and normalize module using `getDefaultExport`
- `getDefaultExport` - normalize CJS and ESM exported value

Client, server and vendor properties can be a function or an object with `pre` and `post` properties:

```js
module.exports = (options, { logger }) => {
  return {
    gluestick: config => config,
    client: {
      pre: config => config,
      post: config => config,
    },
    server: config => config,
    vendor: config => config,
  };
};
```

`pre` functions are executed before applying mutations from project's `src/webpack.config.js`, whereas `post` are executed at the very end.

For client, server and vendor first argument (`config`) is a instance of [webpack-config](https://github.com/Fitbit/webpack-config)'s `Config` class.

## Server plugin
Server plugins similarly to config plugins, must export factory function, that
accept options and gluestick utils.

```js
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

`renderMethod` is useful for supplying custom function to use when rendering app on server.
It only accepts one argument with react root component to render and must return an object
with `body` property with actual string that will be send to browser, `head` array with React
elements that will be injected into `<head>` of document nad optionally `additionalScript`,
which also is a array of React `<script>` elements to inject to document.

## Runtime plugins
Runtime plugins are a little bit different, since they don't export factory
function but must return object with 2 properties:
- `meta` - object with meta information, you must specify if plugin is a `rootWrapper` or a `hook`.
You must provide exactly one flag in `meta` object:
```js
const meta = { rootWrapper: true };
```
or
```js
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
```js
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
