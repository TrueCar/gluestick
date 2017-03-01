# `gluestick-env-expose-ast`
This plugin allows to automatically export environment variables (`process.env.*`) raversing AST of provided file.
For example if this plugin find `process.env.ENV_VAR_0` this variable will be exposed
in final build, both on client and server.

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
- `parse`: `string | string[]` - path or array of paths to files which will be parsed for `process.env.*`.