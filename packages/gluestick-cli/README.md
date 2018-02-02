# `gluestick-cli`
Gluestick CLI is an command line interface for the `gluestick` package. It exposes the few commands from your global packages, and proxies the rest of them to your [local distribution of gluestick](../packages/gluestick).

## Exposed commands

### `gluestick new`

Create a new GlueStick project with latest `gluestick` version available on npm

```bash
gluestick new <YOUR_APPLICATION_NAME>
```

Available options:

* `-d, --dev <path>` - Relative path to development gluestick repo
* `-n, --npm` - Use npm instead of yarn for install dependencies
* `-s, --skip-main` - Skip `main` app generation


### `gluestick reinstall-dev`

Reinstall Gluestick dependencies

```bash
gluestick reinstall-dev
```

### `gluestick watch`

Watches and applies changes from the Gluestick package to the current project

```bash
gluestick watch
```

### `gluestick reset-hard`

Removes Gluestick dependencies and does a clean build

```bash
gluestick reset-hard
```
