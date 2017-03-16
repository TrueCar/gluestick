# `gluestick-plugin-bunyan`
This plugin allows to use [bunyan](https://github.com/trentm/node-bunyan "bunyan") as a logger.

## How to use
* Install plugin
```
npm install --save gluestick-plugin-bunyan
```
* Define (and configure) plugin in `src/gluestick.plugins.js`:
```javascript
export default [
 {
   plugin: 'gluestick-plugin-bunyan',
   options: {
      name: <string>,
      level: <level name or number>,
      stream: <node.js stream>,
      streams: [<bunyan streams>, ...],
      serializers: <serializers mapping>,
      src: <boolean>,
      // Any other fields are added to all log records as is.
      foo: 'bar',
   },
 },
]
```
