# Commands
GlueStick comes with several commands to help you get started. This is the full list of commands
available in GlueStick:

### `gluestick new`

Generates a new project

If you use the `new` command from `gluestick-cli`, it will use the latest `gluestick` version available on npm

```bash
gluestick new <YOUR_APPLICATION_NAME>
```

Available options:

* `-d, --dev <path>` - Relative path from inside the created directory to the development version of gluestick
* `-n, --npm` - Use npm instead of yarn to install dependencies
* `-s, --skip-main` - Gluestick will not generate the main app

### `gluestick generate`

Generates a new entity from a given template

```bash
gluestick generate <ENTITY_TYPE> <ENTITY_NAME>
```

Available options:

* `-A --app <appName>` - App in which to generate files (eg: `main`, `shared`)
* `-F, --functional` - Generate stateless functional component
* `-O, --gen-options <value>` - Options to pass to the generator (see [generators](Generators.md))

### `gluestick destroy`

Removes the entity created by the `generate` command

> The `destroy` command only removes files, meaning if the entity generator modifies an already
existing file, you need to manually update that file, so this command works best with `component`
and `container`, but for the `reducer` generator it will only remove the reducer and test for it,
so any reference to that reducer in `reducers/index.js` must be removed manually.

```bash
gluestick destroy <ENTITY_TYPE> <ENTITY_NAME>
```

Available options:

* `-A --app <appName>` - App from which entity should be removed (eg: `main`, `shared`)

### `gluestick start`

Starts a gluestick project

> If you want to start your project in production mode, run this command with `NODE_ENV=production`.

```bash
gluestick start
```

Depending on the `NODE_ENV` value and presence of the `-P`/`--skip-build` flag,
the `start` command applies different behaviours:

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
* `-D, --debug-server` - Debug server side rendering with the built-in node inspector
* `-p, --debug-port <number>` - Port on which to run node inspector
* `-C --coverage` - Create test coverage report
* `-P, --skip-build` - Skip build when running in production mode
* `-S, --skip-dep-check` - Skips the check for version discrepancies between package.json and node_modules

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
* `--client` - Build only the client bundle
* `--server` - Build only the server bundle
* `-Z, --static [url]` - Prepare static HTML for each entry (and use the provided `url` (`hostname`) to fetch HTML from renderer, by default it is `localhost`)
* `-S, --stats` - Output webpack stats
* `-A, --app` - Build only a specific app or a group of them
* `-D, --vendor` - Build the vendor DLL bundle
* `-B, --skip-if-ok` - Skip the vendor DLL recompilation if the bundle is valid
* `--no-progress` - Disable progress indicator

### `gluestick bin`

Access the dependencies bin directory

```bash
gluestick bin <DEPENDENCY_NAME> -- <DEPENDENCY_ARGS>
```

### `gluestick dockerize`

Create docker image (requires `docker` installed on your machine)

```bash
gluestick dockerize
```

### `gluestick test`

Run the project’s test suite

```bash
gluestick test
```

Available options:

* `-D, --debug-test` - Debug tests with the built-in node inspector

This command supports all [Jest CLI options](https://facebook.github.io/jest/docs/cli.html#options)
including `<regexForTestFile>` argument.

Example:
```bash
gluestick test --watch Home
```

## Development commands

### `gluestick reinstall-dev`

Reinstall gluestick dependencies

```bash
gluestick reinstall-dev
```

### `gluestick watch`

Watches and applies changes from the gluestick package to the current project

```bash
gluestick watch
```

### `gluestick reset-hard`

Removes core GlueStick dependencies and cahce, and reinstalls GlueStick dependencies

```bash
gluestick reset-hard
```

#### Gluestick CLI & Gluestick dependency commands

You can check which commands are being called by `gluestick` and `gluestick-cli` here:

* [gluestick-cli](../packages/gluestick-cli/README.md)
* [gluestick](../packages/gluestick/README.md)

## Environment variables
To pass enviroment variables when running a command, simply add them at the beginning:
```bash
ENV_VAR_NAME=env_var_value gluestick <command>
```
for example to set `NODE_ENV` to production use:
```bash
NODE_ENV=production gluestick <command>
```

## Generators

Generators documentation is available [here](Generators.md).

## Caching & Hooks

Caching & Hooks documentation is available [here](./configuration/CachingAndHooks.md).

## Styles

Styles documentation is available [here](./configuration/Styles.md).

## CLI message logging

By default GlueStick will use the dark theme when logging messages. If you want to use the light one, either set the `GS_LOG_LIGHT` environment variable to `true` or pass `--light` (`-l`) option when
running a command.

For better CI/CD and other build tools support, GlueStick will switch to _machine friendly output_ mode, -- instead of a colorful header prefixing message, you will get a log matching the following format:
```
[GleuStick][<command>][<headerTitle>] <message>
```
To switch to _machine friendly_ mode, one of the following conditions must be met:

* `NODE_ENV` must be set to `production`
* `CI` must be set (to any value)
* `CD` must be set (to any value)

However, if you want to overwrite this behaviour pass `GS_LOG_PRETTY=true` when running a command.

## Resolving apps to build and run
When you run the `start` command, you can specify which app or which group of apps to build and run.
It's worth knowing how the resolving algorithm works:

If passed value (`appName`) starts with `/`, it will build and run the single app which has a `name`
property equal to the passed value. If the `name` property is not defined, it will camelCase the app
key and check if it equals the passed value.

To run the app with `/` key in `src/entries.json`, you need to pass `/main`.

If the passed value doesn't start with `/`, it will check the `group` property to see if the app is
assigned to any group, then if it's assigned to the passed group name. All group names
will be converted to camelCase.
