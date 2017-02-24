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
GlueStick works best with v6.x.x of node. Versions prior to v6 are not currently supported and node v7 has known issues: https://github.com/TrueCar/gluestick/issues/322

## Install
```bash
npm install gluestick -g
```

## Getting Started
You can view a complete getting started guide on our blog https://www.drivenbycode.com/getting-started-with-gluestick/

## Overview
GlueStick comes with several generators to help you get started. To create a
new GlueStick project, run the following command:
```bash
gluestick new <YOUR_APPLICATION_NAME>
```

This will create the boilerplate code needed for a GlueStick application as
well as install all of the initial `npm` dependencies.

Change directories into your projects folder and start your app and tests with:
```bash
gluestick start
```

You can also run `client` and `server` side separately with:
```bash
gluestick start-client
```
or
```bash
gluestick start-server
```

## Generators
To help speed up development, GlueStick includes generators for common types of
files. For Gluestick provided generators, you can also provide an entry point
`-E` where the files should be included: `shared` or `apps/${appName}`. If you
 do not provide one, `apps/main` will be used.

#### App Generator
The app generator will create new folder structure for a new app.

Example:
```
gluestick generate app some-name
```

#### Container Generator
The container generator will create a basic React component in the containers folder that is
already hooked up to redux using the `@connect` middleware.

Example:
```
gluestick generate container MyContainer -E shared
```

#### Component Generator
The component generator will create a basic React component and a starting test
file for that component.

Example:
```
gluestick generate component MyComponent
```

#### Reducer Generator
The reducer generator will create a new base redux reducer for you and
automatically export it from the `reducers/index.js` file.

Example:
```
gluestick generate reducer todos -E shared
```

### Destroy command

You can also use `destroy` to delete generated files: `component`, `container`
and `reducer`.

Example:
```
gluestick destroy component MyComponent -E apps/some-app
```

## Code quality

### Tests
GlueStick sets up a testing environment using [Jest](https://facebook.github.io/jest/) and [Enzyme](https://github.com/airbnb/enzyme).

You simply need to create files in any `__tests__` directory with the extension `.test.js` and they
will be executed through the test runner using:
```
npm test
```

Tests can also be typed using `Flow` (see below). We use [flow-typed](https://github.com/flowtype/flow-typed) for Jest under the hood.

### Types
All generated files will use `/* flow */` and will be typed.
We recommend you to do the same for your own files. To run flow just run:
```
npm run flow
```

### Linting
There is a predefined linting configuration (following [airbnb config](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb))
for your project. Run it using:
```
npm run lint
```

### Integration
All of the above code quality commands can be executed simultaneously by:
```
npm run ci
```

## Styles
The preferred way to style components in the GlueStick environment is to use
[Radium](https://github.com/FormidableLabs/radium), but we also actively use
and support css and sass.

#### CSS and SASS
If you want to include a base stylesheet (like bootstrap css), you can import
your stylesheet at the top of any file and it will be included when the page
loads. Any updates to your styles will also be hot loaded. You can use plain
css or sass.

Example:
Edit /Index.js
```
import React, { Component } from "react";
import "assets/css/my-custom-css.css";
…
```

The code above will automatically extract the css from the referenced file and
include it in a base css file that is included on new page loads. References to
images and font files will automatically be handled as well.

_If you would like to see better css support, please submit a pull request :)_

## Caching
Caching support has been added for server side rendering. This lets you cache
entire page responses on pages where it makes sense like a home or landing
page.

Example:
```
<Route path="/" component={HomeApp} cache={true} />
```

*Route property:*
`cache` - boolean

*Additional optional cache properties:*
`cacheTTL` - number of seconds to store the cache for a particular route

## Hooks
Gluestick also provide hooks which can be defined in `src/gluestick.hooks.js`.
You can use single hook or array of hooks like in example below. Usually you have to return modified value at the end of hook.
```javascript
/* src/gluestick.hooks.js */

const preRenderFromCache = (cachedOutput) => {
  // Do something with output and return it.
  // Gluestick will render output with changes.
  return cachedOutput;
};

const postRenderRequirementsOne = (requirements) => {
  // Do something with requirements and return it.
  return requirements;
}

const postRenderRequirementsTwo = (requirements) => {
  // Here we have requirements with changes from postRenderRequirementsOne.
  return requirements;
}

const errorHook = (error) => {
  // In this hook we don't need to return value.
  // Unless you have another error hook which will be called after this one.
  console.log('Custom hook for error', error);
}

export default {
  preRenderFromCache,
  postRenderRequirements: [
    postRenderRequirementsOne,
    postRenderRequirementsTwo,
  ],
  error: errorHook,
};
```

| name                   | need return value? |            when it is called?            |
|------------------------|:------------------:|:----------------------------------------:|
| preRenderFromCache     |        true        | before we render output from cache       |
| postRenderRequirements |        true        | after we get requirements for entrypoint |
| preRedirect            |        false       | before redirect                          |
| postRenderProps        |        true        | after we get render props                |
| postGetCurrentRoute    |        true        | after we get current route               |
| postRender             |        true        | after render                             |
| error                  |        false       | before we render error template          |


## Hot Loading
GlueStick's development environment utilizing hotloading so your changes will
show up in the browser as you go. This is sort of experimental but it works
great most of the time. However, sometimes you will still need to refresh the
browser for certain changes.

## Plugins
Plugins documentation is available [here](docs/PLUGINS.md).

## Apps
Apps documentation is available [here](docs/APPS.md).

## Deployment & Production
To run a gluestick application in production mode, simple set `NODE_ENV`
envrionment variable to `production`.
For example: `NODE_ENV=production gluestick start`

GlueStick will serve assets for you in production mode but it is recommended
you serve assets from a Content Delivery Network. To do that, simply run
`gluestick build` and it will generate a folder named `build` in your project
root. This folder will contain all of the assets needed to run your app.

Finally, you need to update your application config file
(src/config/application.js) to define the asset path for production.  You can hardcode the value or you can just use the `ASSET_URL` environment variable to specify the base uri of your production assets.

### Port Overriding
If you need to override the port in production, just set the environment variable `PORT` to whatever you need it to be.

## Contribution to GlueStick
### Debugging GlueStick test
Run the following command and specify path to test you want to debug:
```
npm run debug <path-to-test>
```
Example:
```
npm run debug ./test/lib/server/addProxies.test.js
```
