# `gluestick-env-expose-ast`
This plugin allows you to automatically export environment variables (`process.env.*`) by taversing the AST of a provided file.
For example, if the plugin finds `process.env.ENV_VAR_0` this variable will be exposed in the final build, both on client and server.

## How to use
1. Install plugin
```
npm install --save gluestick-env-expose-ast
```
2. Define (and configure) plugin in `src/gluestick.plugins.js`:
```
export default [
  'gluestick-env-expose-ast'
]

// or

export default [
  {
    plugin: 'gluestick-env-expose-ast',
    options: {
      parse: 'file.js'
    },
  },
]
```

## Configuration
- `parse`: `string | string[]` - path or array of paths to files which will be parsed for `process.env.*`
- `exposeRuntime`: `boolean` - replace `process.env` with `window.__GS_ENV_VARS__` to allow passing variables in runtime instead of on compilation time, it will also pass detected variables to the server bundle so `window.__GS_ENV_VARS__` gets properly propagated when renderering pages on the server
