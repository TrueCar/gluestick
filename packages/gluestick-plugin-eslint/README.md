# `gluestick-plugin-eslint`

Adds `eslint-loader` to lint files when compiling them with Webpack.

## How to use
* Install plugin
```
npm install --save eslint-loader gluestick-plugin-eslint
```
* Define (and configure) plugin in `src/gluestick.plugins.js`:
```javascript
export default [
  'gluestick-plugin-eslint'
]

// or

export default [
  {
    plugin: 'gluestick-plugin-eslint',
    options: {
      enableInProduction: true,
      loaderOptions: {
        configFile: 'path/to/eslint-config-file'
      }
    },
  },
]
```

## Configuration
- `enableInProduction`: `boolean` (default: `false`) - enable linting in production
- `loaderOptions`: `Object` (default: `{ configFile: path.join(process.cwd(), '.eslintrc') }`) - [`eslint-loader` options](https://github.com/MoOx/eslint-loader#options)
