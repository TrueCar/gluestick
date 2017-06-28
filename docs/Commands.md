# Commands
GlueStick comes with several commands to help you get started. You can full list of commands available on gluestick below:

### `gluestick new`

Takes care of generating new project

If you use `new` command from `gluestick-cli` it will use latest `gluestick` version available on npm

```bash
gluestick new <YOUR_APPLICATION_NAME>
```

Available options:

* `-d, --dev <path>` - Relative path from inside crated directory to development version of gluestick
* `-n, --npm` - Use npm instead of yarn for install dependencies
* `-s, --skip-main` - Gluestick will not generate main app

### `gluestick generate`

Generates a new entity from given template

```bash
gluestick generate <ENTITY_TYPE> <ENTITY_NAME>
```

Available options:

* `-A --app <appName>` - App in which to generate files (eg: `main`, `shared`)
* `-F, --functional` - Generate stateless functional component
* `-O, --gen-options <value>` - Options to pass to the generator (see [generators](Generators.md))

### `gluestick destroy`

Removes entity created by `generate` command

> `destory` command only removes files, meaning if entity generator modifies already existing file,
you need to manually update that file, so this command works best with `component` and `container`,
but for `reducer` generator it will only remove reducer and test for it, so any reference to that reducer in `reducers/index.js` must be removed manually

```bash
gluestick destory <ENTITY_TYPE> <ENTITY_NAME>
```

Available options:

* `-A --app <appName>` - App from which entity should be removed (eg: `main`, `shared`)s

### `gluestick start`

Starts a gluestick project

> If you want to start your project in production mode, run this command with `NODE_ENV=production`.

```bash
gluestick start
```

Depending on `NODE_ENV` value and presence of `-P`/`--skip-build` flag, `start` command applies different behaviours:

|           `NODE_ENV`          | `-P`/`--skip-build` passed |          client build          | server build |
|:-----------------------------:|:--------------------------:|:------------------------------:|:------------:|
| `development` / not specified |             no             | no (`start-client` is spawned) |      yes     |
| `development` / not specified |             yes            | no (`start-client` is spawned) |      yes     |
|          `production`         |             no             |               yes              |      yes     |
|          `production`         |             yes            |               no               |      no      |

Available options:

* `-T, --run-tests` - Run test hook
* `-L, --log-level <level>` - Set the logging level
  * Valid options: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`
* `-A, --app <appName>` - Specify which app (or group of them) to build and run (see [resolving apps to build and run](#resolving-apps-to-build-and-run))
* `-D, --debug-server` - Debug server side rendering with built-in node inspector
* `-p, --debug-port <number>` - Port on which to run node inspector
* `-C --coverage` - Create test coverage report
* `-P, --skip-build` - Skip build when running in production mode

### `gluestick start-client`

Starts client separately (part of `gluestick start` command)

```bash
gluestick start-client
```

### `gluestick start-server`

Starts server separately (part of `gluestick start` command)

```bash
gluestick start-server
```

Available options:

* `-D, --debug-server` - Debug server side rendering with built-in node inspector
* `-p, --debug-port <number>` - Port on which to run node inspector

### `gluestick build`

Create client and (__default__) / or server bundle

> If you want to build in production mode, run this command with `NODE_ENV=production`.

```bash
gluestick build
```

Available options:
* `--client` - Build only client bundle
* `--server` - Build only server bundle
* `-Z, --static [url]` - Prepare static HTML for each entry (and use provided `url` to fetch HTML from renderer, by default it is `localhost`)
* `-S, --stats` - Output webpack stats
* `-A, --app` - Build only specific app or a group of them
* `-D, --vendor` - Build Vendor DLL bundle
* `-B, --skip-if-ok` - Skip vendor DLL recompilation if the bundle is valid

### `gluestick bin`

Access dependencies bin directory

```bash
gluestick bin <DEPENDENCY_NAME> -- <DEPENDENCY_ARGS>
```

### `gluestick dockerize`

Create docker image (requires `docker` installed on your machine)

```bash
gluestick dockerize
```

### `gluestick test`

Run projects test suite

```bash
gluestick test
```

Available options:

* `-D, --debug-test` - Debug tests with built-in node inspector

This command supports all [Jest CLI options](https://facebook.github.io/jest/docs/cli.html#options)
including `<regexForTestFile>` argument.

Example:
```bash
gluestick test --watch Home
```

## Development commands

### `gluestick reinstall-dev`

Reinstall gluestick dependency project

```bash
gluestick reinstall-dev
```

### `gluestick watch`

Watches and applies changes from gluestick package to current project

```bash
gluestick watch
```

### `gluestick reset-hard`

Removes gluestick dependency project clean build, cache and reinstalls dependencies

```bash
gluestick reset-hard
```

#### Gluestick CLI & Gluestick dependency commands

You can check which commands are being called by `gluestick` and `gluestick-cli` here:

* [gluestick-cli](../packages/gluestick-cli/README.md)
* [gluestick](../packages/gluestick/README.md)

## Environment variables
To pass enviroment variables when running command simply, add them at the beginning:
```
ENV_VAR_NAME=env_var_value gluestick <command>
```
for example to set `NODE_ENV` to production use:
```
NODE_ENV=production gluestick <command>
```

## Generators

Generators documentation is available [here](Generators.md).

## Caching & Hooks

Caching & Hooks documentation is available [here](CachingAndHooks.md).

## Styles

Styles documentation is available [here](Styles.md).

## CLI message logging

By default GlueStick will use dark theme when logging messages. If you want to use the light one, either set `GS_LOG_LIGHT` environment variable to `true` or pass `--light` (`-l`) option when running a command.

For better CI/CD and other build tools support, GlueStick will switch to _machine friendly output_ mode, thus instead of colorful header prefixing message, you will get log matching the following format:
```
[GleuStick][<command>][<headerTitle>] <message>
```
To switch to _machine friendly_ mode, one of the folling condition must be met: 

* `NODE_ENV` must be set to `production`
* `CI` must be set (to whatever value)
* `CD` must be set (to whatever value)

However, if you want to overwrite this behaviour pass `GS_LOG_PRETTY=true` when running a command.

## Resolving apps to build and run
When you run `start` command you can specify which app or which group of apps to build and run. It's worth knowing how resolving algorithm works:

If passed value (`appName`) starts with `/`, it will build and run single app, which has `name` property equal to passed value. If `name` property is not defined, it will camelCase app key and check if it equals passed value.

To run app with `/` key in `src/entries.json`, you need to pass `/main`.

If passed value doesn't start with `/` it will check `group` property to check if the app is assigned to any group then if it's assigned to passed group name. Please not that, all group names will be converted to camelCase.
