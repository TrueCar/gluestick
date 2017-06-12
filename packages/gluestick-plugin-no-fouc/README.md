# `gluestick-plugin-no-fouc`

Removes Flash of Unstyled Content (FOUC) in development.

## How it works
All styles will be extracted to css file using `ExtractTextWebpackPlugin` then, the file will be linked by server/renderer and added to `<head>` element. It sits side-by-side with `style-loader`, so you can still use HMR.

__In production this plugin does nothing.__

## How to use
* Install plugin
```
npm install --save gluestick-plugin-no-fouc
```
* Define (and configure) plugin in `src/gluestick.plugins.js`:
```javascript
export default [
  'gluestick-plugin-no-fouc'
]

// or

export default [
  {
    plugin: 'gluestick-plugin-no-fouc',
    options: {
      filename: '[name].fouc-reducer.css'
    },
  },
]
```

## Configuration
- `filename`: `string` (default: `[name]-[contenthash].init-no-fouc.css`) - name of the file to which all styles will be extracted, can contain webpack tokens eg: `[name]`, `[hash]`, `[contenthash]` and so on
