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
