# GlueStick - Beyond the Boilerplate
[![npm](https://img.shields.io/npm/v/gluestick.svg)](https://www.npmjs.com/package/gluestick)
[![Build Status](https://circleci.com/gh/TrueCar/gluestick.svg?style=svg)](https://circleci.com/gh/TrueCar/gluestick)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/TrueCar/gluestick.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/TrueCar/gluestick/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/TrueCar/gluestick.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/TrueCar/gluestick/alerts)

GlueStick is a command line interface for quickly developing universal web
applications using React and Redux.

## Why is your project or boilerplate not enough?
1. **You need integrated updates.** Without integrated updates, you are forced to manually merge in new features/fixes.
2. **Isomorphic rendering.** Server-side and client-side rendering are identical. No more worries about SEO, loading spinners, or users with javascript disabled
3. **Integrated dockerization.** Go from development to production as simply as `gluestick dockerize MyApp`
4. **Automatic babel and webpack loader support.** Use the latest JavaScript features
5. **Automatic test framework setup.** Preloaded with `Jest` and `Enzyme` right out of the box
6. **Built in best practices.** Things like code splitting, hot module replacement, react-router, etc
7. **Rails-like generators** for common needs like components/reducers/containers/etc, with all necessary hooks and tests


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

Gluestick is actively worked on, supported and used in production by TrueCar.

## What about Create React App?
Create React App is an excellent command line interface for creating React applications.
Gluestick is a much more opinionated tool, which offers several features out-of-the-box
(pre-configured) that Create React App does not (and in some cases would require ejection
from Create React App), such as:

* Code splitting
* Server rendering
* React Router and Redux implementation
* Generators for standard development needs

## Requirements
Node 6.3.0+

## Quick Start
```bash
npm install gluestick-cli -g
gluestick new SampleProject
cd SampleProject
gluestick start
```

## Docs & Help

* [Commands](docs/Commands.md)
* [Development](docs/Development.md)
* [Plugins](docs/configuration/Plugins.md)
* [Configuration](docs/Configuration.md)
* [Styles](docs/configuration/Styles.md)
* [Webpack Bundle Analyzer Guide](docs/guides/WebpackBundleAnalyzerGuide.md)
* [Contribution Guidelines](CONTRIBUTING.md)

## Guides

* [Profiling GlueStick server](docs/guides/ProfilingRenderer.md)

## Terms & Definitions

* [`Gluestick`](https://github.com/TrueCar/gluestick) is a monorepo. It is published to npm with `Lerna` and contains depdent modules or "packages" for building Gluestick apps. The Gluestick repo uses Lerna [1](https://www.npmjs.com/package/lerna),[2](https://lernajs.io/) to help break what would otherwise be a potentially large code base in to smaller, versioned packages.
* [`gluestick-cli`](https://github.com/TrueCar/gluestick/tree/develop/packages/gluestick-cli) - A package in the Gluestick monorepo that acts as a thin wrapper for managing Gluestick apps from the command-line. With it you can create an app, destroy it, auto upgrade all of its dependent packages, etc... It has a few commands of its own, but several are proxied to your local Gluestick package.
* [`gluestick`](https://github.com/TrueCar/gluestick/tree/develop/packages/gluestick) - A package in the Gluestick monorepo that provides additional command line functionality for building for universal-React apps as well as the internals (guts) for driving the Gluestickm Universal React apps themselves.
* [`Lerna`](https://github.com/lerna/lerna) - "A tool for managing JavaScript projects with multiple packages", or put another way: "Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm." Packages are independent codebases that can be versioned and published to `npm`.

## F.A.Q.s

Q: *The main project is called "Gluestick", but the binary is called "gluestick-cli", but there's a package in the main project called "gluestick". What's up with that?*

A: Gluestick is a monorepo. `gluestick-cli` is a sub-package in that repo that is deployed to `npm` and is used to manage Gluestick apps. `gluestick` (little 'g') is also a sub-package and contains the guts of Gluestick applications.
