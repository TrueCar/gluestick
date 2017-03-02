# Apps
When creating new project entry app (`main`) will be already generated.
For most projects it will suffice, but sometimes you will need to slit your app
into multiple smaller sub-apps.

To create new sub-app run the followiing command inside project:
```
gluestick generate app my-sub-app
```

This will create proper directory structure and will modify `src/entries.json`.

## `entries.json`
Sometimes you will need to manually modify `src/entries.json` file.
This fill containes definition for every entry aka sub-app.

Schema for this file looks like this:
```json
  "/<key>": {
    "name": "<name>",
    "component": "<path/to/entry/root/component>",
    "routes": "<path/to/routes>",
    "reducers": "<path/to/reducers>"
  }
``` 

- `key`: URL-like entry name for example `/vehicles`, must be kebab-case
- `name`: custom, user-firendly entry name (optional), must be camelCase
- `component`: path to root component of entry
- `routes`: path to routes declaration file
- `reducer`: path to reducers file that exportes object

**Plese note** that reducer should `export` (`default`) object with key-value pairs,
when value is reducer function. Do not use `combineReducer`, it will be used later internally
by gluestick.

Example of `entries.json` with `main` and `help` apps:
```json
{
  "/": {
    "component": "src/apps/main/Index.js",
    "routes": "src/apps/main/routes.js",
    "reducers": "src/apps/main/reducers/index.js"
  },
  "/help": {
    "component": "src/apps/help/Index.js",
    "routes": "src/apps/help/routes.js",
    "reducers": "src/apps/help/reducers/index.js"
  }
}
```