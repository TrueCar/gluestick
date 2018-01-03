# Configuration

There are few files which allows to configure GlueStick:
* [`src/entires.json`](./configuration/Apps.md) - define entries (apps)
* [`src/vendor.js`](#vendoring) - Define vendored modules/packages
* [`src/gluestick.hooks.js`](./configuration/CachingAndHooks.md#hooks) - define hooks which will run on specific lifecycle events
* [`src/gluestick.plugins.js`](./configuration/Plugins.md) - specify which plugins to use
* [`src/gluestick.config.js`](#gluestick-config) - overwrite gluestick config
* [`src/webpack.config.js`](./configuration/WebpackConfig.md) - overwrite webpack client and server configuation
* [`src/config/application.js`](#global-project-config) - global project configuration
* [`src/config/caching.server.js`](./configuration/CachingAndHooks.md#caching) - setup component caching
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
app/entrypoint, update `src/entries.json` to use that file (more on this [here](./configuration/Apps.md)) and write additional property `reduxOptions: { middlewares: Function[], thunk: ?Function }`.

## Global project config
All project-wide configuration lives here in `src/config/application.js`.

GlueStick itself will look only for those properties:
* `proxies` - setup additional proxies
* `httpClient` - configure http client
* `headContent` - configure page `<title>` element
* `logger` - configure logger

However, you can put your own properties here and read them by importing this files via alias `config/application`.

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
To modofy path to asset files (previously known as `assetPath`), define `publicPath` and assign a value in Gluestick config, for example:
```
export default config => ({
  ...config,
  publicPath: process.env.ASSET_URL || '/assets/',
});
```

To see how the default GlueStick config looks like navigate [here](https://github.com/TrueCar/gluestick/blob/staging/packages/gluestick/src/config/defaults/glueStickConfig.js).

# Vendoring

Some packages or modules like `React` don't change frequently, so they can be vendored.
In order to do so, import the desired module/file in `src/vendor.js`. This file will become a separate entry
used by either:
* `CommonsChunkPlugin`:
  * build vendor as a normal bundle
  * rebuild automatically when changed
  * preferd for code that changes _kind of_ frequently at a cost of increased build time
  * automatic common modules extraction to vendor bundle
  * great for smaller and medium sized projects

or

* `DllPlugin`:
  * create Dynamicaly Linked Library with vendored modules
  * no automatic rebuilds
  * prefered for code that change rerely
  * shared between parallel builds
  * great for bigger projects

`CommonsChunkPlugin` is the default used plugin, since it doesn't require any changes to be made or commands
to be run.

> Please note, that `CommonsChunkPlugin` and `DllPlugin` are __not interoperable__, so it's up to you to decide
which one suits your project better.

If you want to use `DllPlugin`, you firstly need to execute `gluestick build --vendor` (for production add `NODE_ENV=production` when running the command), before building any other app.
This command will create files (including your vendor DLL bundle) under `build/assets/dlls`. Now if you `build` or `start` an app or whole project, it will use vendor DLL bundle.

`DllPlugin` is the essential part that allows for app builds parallelisation.
In order to split app builds you, firstly need to have vendor DLL bundle compiled and available for each
build thread/process, then to build a single app use `gluestick build --client -A /<appName>` command.

Also remember to build server/renderer bundle as well - `gluestick build --server`.

