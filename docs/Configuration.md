# Configuration

There are few files which allows to configure GleuStick:
* [`src/entires.json`](./Apps.md) - define entries (apps)
* [`src/gluestick.hooks.js`](./CachingAndHooks.md#hooks) - define hooks whoch will run on specific lifecycle events
* [`src/gluestick.plugins.js`](./Plugins.md) - specify which plugins to use
* [`src/webpack.hooks.js`](./CachingAndHooks.md#webpack-hooks) - overwrite webpack client and server configuation
* `src/config/application.js` - project configuration
* [`src/config/caching.server.js`](./CachingAndHooks.md#caching) - setup component caching
* `src/config/init.browser.js` - specify code which will run right before client bundle is run in browser
* [`src/config/redux-middleware.js`](#redux-config) - specify additional radux middleware and overwrite thunk middleware

## Redux config
All redux configuration can be specified in `src/config/redux-middleware.js` file.

The `default` export should return array of additional middlewares.
To specify custom thunk middleware export it using named `thunkMiddleware` export:
```
export default []; // additional middlewares
export const thunkMiddleware = thunk.withExtraArgument({ api: /* ... */ });
```
This allowes you to [inject custom argument](https://github.com/gaearon/redux-thunk#injecting-a-custom-argument).