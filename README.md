# GlueStick - Beyond the Boilerplate
[![npm](https://img.shields.io/npm/v/gluestick.svg)](https://www.npmjs.com/package/gluestick)
[![Build Status](https://travis-ci.org/TrueCar/gluestick.svg?branch=develop)](https://travis-ci.org/TrueCar/gluestick)

GlueStick is a command line interface for quickly developing universal web
applications using React and Redux.

## Why your project or boilerplate isn't enough?
1. **You need integrated updates.** Without integrated updates, you are forced to manually merge in new features/fixes.
2. **Isomorphic rendering.** Server-side and client-side rendering are identical. No more worries about SEO, pesky “loading” spinners, or users with javascript disabled
3. **Integrated dockerization.** Go from development to production as simple as `gluestick dockerize MyApp`
4. **Automatic babel and webpack loader support.** Cause writing ES5 is so boring
5. **Automatic test framework setup.** Preloaded with `Mocha`, `Chai`, `Sinon`, `Enzyme`, and `React.TestUtils` right out of the box
6. **Built in common practices.** Things like code splitting, hot module replacement, react-router, etc
7. **Rails like generators** for common needs like components/reducers/containers/etc, with all necessary hooks and tests


## Why GlueStick?
GlueStick allows users to quickly create new applications with its bootstrap
generator, along with generators for components, containers, and reducers. In
addition, GlueStick contains a fully functional test environment, server-side
rendering, and an asset bundler. However, GlueStick sidesteps the hassle of any
configuration files.

The goal is not to be another boilerplate for building universal web
applications. Instead, the goal is to abstract all of the boilerplate code into
one location that the developer doesn't have to worry about. Not only does this
make your application code cleaner but it makes it easier to update the
boilerplate code as new improvements are discovered.

Is actively being worked on and supported by TrueCar.

## Requirements
GlueStick works best with v6.x.x of node. Versions prior to v6 are not currently supported.

## Install
```bash
npm install gluestick -g
```

## Docs & Help

* [Commands](docs/COMMANDS.md)
* [Apps](docs/APPS.md)
* [Plugins](docs/PLUGINS.md)
* [Code quality](docs/CODE_QUALITY.md)
* [Styles](docs/STYLES.md)
* [Caching & Hooks](docs/CACHING_AND_HOOKS.md)
* [Environment details](docs/ENV_DETAILS.md)

## Contributing

For contributing instructions please see [contributon guide](CONTRIBUTING.md).
