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
```
npm install gluestick -g
```

## Getting Started
You can view a complete getting started guide on our blog https://www.drivenbycode.com/getting-started-with-gluestick/

## Overview
GlueStick comes with several generators to help you get started. To create a
new GlueStick project, run the following command:
```
gluestick new newapp
```

This will create the boilerplate code needed for a GlueStick application as
well as install all of the initial npm dependencies.

Change directories into your projects folder and start your app and tests with:
```
gluestick start
```

## Generators
To help speed up development, GlueStick includes generators for common types of
files.

#### Container Generator
The container generator will create a basic React component in the containers folder that is
already hooked up to redux using the `@connect` middlware.

Example:
```
gluestick generate container MyContainer
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
gluestick generate reducer todos
```

## Tests
GlueStick sets up a testing environment using Karma, Mocha, Chai and Sinon and enzyme.
React's TestUtils are also available globally in your test files. You simply
need to create files in the `test` folder with the extension .test.js and they
will be executed through the test runner.

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

## Hot Loading
GlueStick's development environment utilizing hotloading so your changes will
show up in the browser as you go. This is sort of experimental but it works
great most of the time. However, sometimes you will still need to refresh the
browser for certain changes.

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