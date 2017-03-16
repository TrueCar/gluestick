# `gluestick`
Gluestick package is a dependency which is being added to your project to handle most of `gluestick` functionalities. Commands are available through `bin` directory from your `node_modules` or proxied via [gluestick's command line interface](../packages/gluestick-cli).

## Exposed commands

- `gluestick new <YOUR_APPLICATION_NAME>` - generate new project
- `gluestick generate <ENTITY_TYPE> <ENTITY_NAME>` - generates a new entity from given template
- `gluestick start` - starts a gluestick project
- `gluestick build` - create an production asset build
- `gluestick bin <DEPENDENCY_NAME> -- <DEPENDENCY_ARGS>` - Execute binary dependenciy
- `gluestick dockerize` - create docker image (requires `docker` installed on your machine)
- `gluestick start-client` - starts client separately (part of `gluestick start` command)
- `gluestick start-server` - starts server separately (part of `gluestick start` command)
- `gluestick test` - run projects test suite

Detailed description on all commands is available [here](../../docs/Commands.md)
