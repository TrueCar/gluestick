## Webpack Config

GlueStick allows you to mutate it's default Webpack client, server and vendor (DLL) configs. All of which are instances of [webpack-config](https://github.com/Fitbit/webpack-config)'s `Config` class.

You can overwrite configs in `src/webpack.config.js`:

```js
import Config from "webpack-config";

export const client = base => new Config().merge(base).merge(config => {
  // Mutate config here
});
export const server = base => new Config().merge(base).merge({
  /* Add/overwrite properties, append new plugins/rules etc */
});
export const vendor = base => new Config().merge(base);
```

__IMPORTANT:__ If you're upgrading from GlueStick below version `1.16.0`, run `gluestick auto-upgrade` command to ensure `src/webpack.config.js` file exists!
