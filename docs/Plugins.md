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

# How to write a plugin
First of all, there are 3 types of plugins:
- `config` - modifies gluestick and webpack configs, both server and client one
- `runtime` - bundled into JavaScript bundles and executed when final output is being
rendered
- `server` - bundled into renderer (server) bundle and executed when renderer starts

Plugin must implement at least one type, but they can have multiple types specified.
To implement a type, you must create a file in top level of plugin directory and name
it: `<type>.js` so it can be: `config.js`, `runtime.js`, `server.js`.

You don't need to worry about compilation, babel, loaders etc. because they will be
compiled inside gluestick on the fly as long as you use features that are available in:
- `babel-preset-es2015`,
- `babel-preset-stage-0`,
- `babel-preset-react`,
- `babel-plugin-transform-decorators-legacy`,
- `babel-plugins-transform-flow-strip-types`

## Config plugin
Must export function that returns object will overwriters.
```
module.exports = (options, { logger }) => {
  return {
    overwriteGluestickConfig: config => config,
    overwriteClientWebpackConfig: config => config,
    overwriteServerWebpackConfig: config => config,
  };
};
```
Exported function is a factory for `overwriteGluestickConfig`, `overwriteClientWebpackConfig`
and `overwriteServerWebpackConfig`. This factory function accepts options that are defined
in plugins declaration file inside project, by default `src/gluestick.plugins.js`. Second
argument is an object with utilities provided by gluestick, currently the only one is
logger, that you can use to print messages using:
- `logger.debug(...args)`
- `logger.info(...args)`
- `logger.success(...args)`
- `logger.warn(...args)`
- `logger.error(...args)`

Each of overwriters must be a function accepting prepared by gluestick config and must return
altered config:

- `overwriteGluestickConfig: config => config` - accepts gluestick config and must return the same
valid gluestick config with modified values
- `overwriteClientWebpackConfig: config => config` - accepts client webpack config and
must return valid webpack config for client bundle
- `overwriteServerWebpackConfig: config => config` - accepts server webpack config and
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


