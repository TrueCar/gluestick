# `gluestick-plugin-bunyan`
This plugin allows you to use [bunyan](https://github.com/trentm/node-bunyan "bunyan") as a logger.

## How to use
* Install plugin
```
npm install --save gluestick-plugin-bunyan
```
* Define plugin in `src/gluestick.plugins.js`:
```javascript
export default ['gluestick-plugin-bunyan'];
```
* Add file in src/ folder called `bunyan.config.js` and add configuration in it
```javascript
export default {
   name: <string>,  // Required
   level: <level name or number>,
   stream: <node.js stream>,
   streams: [<bunyan streams>, ...],
   serializers: <serializers mapping>,
   src: <boolean>,
};
```
[Here](https://github.com/trentm/node-bunyan#introduction "bunyan") you can read more about options.
