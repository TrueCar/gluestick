# `gluestick`
Gluestick package is a dependency which is being added to your project to handle most of `gluestick` functionalities. Commands are available through `bin` directory from your `node_modules` or proxied via [gluestick's command line interface](../packages/gluestick-cli).

## Exposed commands

### `gluestick new`

Takes care of generating new project

```bash
gluestick new <YOUR_APPLICATION_NAME>
```

Available options:

* `-d, --dev <path>` - Relative path to development version of gluestick
* `-y, --yarn` - Use yarn to perform installations (CLI option)

### `gluestick generate`

Generates a new entity from given template

```bash
gluestick generate <ENTITY_TYPE> <ENTITY_NAME>
```

Available options:

* `-E --entry-point <entryPoint>` - Entry point for generated files
* `-F, --functional` - Generate stateless functional component
* `-O, --gen-options <value>` - Options to pass to the generator

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

### `gluestick test`

Run projects test suite

```bash
gluestick test
```

Available options:

* `-F, --firefox` - Use Firefox with test runner
* `-S, --single` - Run test suite only once
* `-D, --debug-test` - Debug tests with built-in node inspector
* `-C --coverage` - Create test coverage
* `-W --watch` - Watch tests
* `-R --pattern [pattern]` - Run specific test regex pattern name
