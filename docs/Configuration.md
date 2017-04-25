# Configuration

There are few files which allows to configure GleuStick:
* [`src/entires.json`](./Apps.md) - define entries (apps)
* [`src/gluestick.hooks.js`](./CachingAndHooks.md#hooks) - define hooks which will run on specific lifecycle events
* [`src/gluestick.plugins.js`](./Plugins.md) - specify which plugins to use
* [`src/gluestick.config.js`](#gluestick-config) - overwrite gluestick config
* [`src/webpack.hooks.js`](./CachingAndHooks.md#webpack-hooks) - overwrite webpack client and server configuation
* [`src/config/application.js`](#global-project-config) - global project configuration
* [`src/config/caching.server.js`](./CachingAndHooks.md#caching) - setup component caching
* `src/config/init.browser.js` - specify code which will run right before client bundle is run in browser
* [`src/config/redux-middleware.js`](#redux-config) - specify additional redux middleware and overwrite thunk middleware

## Redux config
All redux configuration can be specified in `src/config/redux-middleware.js` file.

The `default` export should return array of additional middlewares.
To specify custom thunk middleware export it using named `thunkMiddleware` export:
```
export default []; // additional middlewares
export const thunkMiddleware = thunk.withExtraArgument({ api: /* ... */ });
```
This allows you to [inject custom argument](https://github.com/gaearon/redux-thunk#injecting-a-custom-argument).

**IMPORTANT**: This configuration is project wide, meaning it will be used for every app/entrypoint.
If you need to overwrite it for specific app/entrypoint, you must create configuration file for this
app/entrypoint, update `src/entries.json` to use that file (more on this [here](./Apps.md)) and write additional property `reduxOptions: { middlewares: Function[], thunk: ?Function }`.

## Global project config
All project-wide configuration lives here in `src/config/application.js`.

GlueStick itself will look only for those properties:
* `proxies` - setup additional proxies
* `httpClient` - configure htt client
* `headContent` - configure page `<title>` element
* `logger` - configure logger
* `assetPath` - set path to static assets directory

However, you can put your onw properties here and read them by importing this files via alias `config/application`.

In a nutshell, this configuration file have the following structure:
```typescript
type HeadContent = {
  title: string;
  titleTemplate: string;
  meta: { name: string, content: string }[];
}

type Logger = {
  pretty: boolean;
  level: string;
}

type EnvConfig = {
  assetPath: string;
  head: HeadContent;
  logger: Logger;
  httpClient?: Object;
  proxies?: [{
    path: string;
    destination: string;
    options?: Object;
    filter?: Function;
  }];
}

const config: EnvConfig = {
  assetPath: '/assets',
  head: {
    title: 'My Gluestick App',
    titleTemplate: '%s | Gluestick Application',
    meta: [
      { name: 'description', content: 'Gluestick application' }
    ]
  }
  logger: {
    pretty: true,
    level: 'info',
  }
}

export default config;
```


## Gluestick config
To modify GlueStick config use `src/gluestick.config.js` file. It must return function or array of functions
as a `default` export:
```
export default config => config;
// or 
export default [config => config];
```
This function accepts gluestick config (`object`) as a first argument and must return modified
config.

For example, this code snippet overwrites the default ports:
```
export default config => ({
  ...config,
  ports: {
    client: 1111,
    server: 2222,
  }
})
```
To see how the default GlueStick config looks like navigate [here](https://github.com/TrueCar/gluestick/blob/staging/packages/gluestick/src/config/defaults/glueStickConfig.js).