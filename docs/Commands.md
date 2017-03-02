# Commands
GlueStick comes with several commands to help you get started. You can full list of commands available on gluestick below:

### `gluestick new`

Takes care of generating new project

```bash
gluestick new <YOUR_APPLICATION_NAME>
```

Available options:

* `-d, --dev <path>` - Relative path from inside crated directory to development version of gluestick
* `-y, --yarn` - Use yarn to perform installations (not working yet, see [#528](https://github.com/TrueCar/gluestick/issues/528))

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

```bash
gluestick start
```

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

Create an production asset build

```bash
gluestick build
```

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

* `-S, --single` - Run test suite only once
* `-D, --debug-test` - Debug tests with built-in node inspector
* `-C --coverage` - Create test coverage
* `-W --watch` - Watch tests
* `-R --pattern [pattern]` - Run specific test regex pattern name

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

## Generators

Generators documentation is available [here](Generators.md).

## Caching & Hooks

Caching & Hooks documentation is available [here](CachingAndHooks.md).

## Styles

Styles documentation is available [here](Styles.md).
