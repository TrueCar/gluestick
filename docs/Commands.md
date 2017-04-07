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

* `-E --entry-point <entryPoint>` - Entry point for generated files
* `-F, --functional` - Generate stateless functional component
* `-O, --gen-options <value>` - Options to pass to the generator (see [generators](Generators.md))

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
* `-E, --log-pretty [true|false]` - Set pretty printing for logging
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
