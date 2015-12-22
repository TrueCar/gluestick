# GlueStick
[![npm package][npm-badge]][npm]

GlueStick is a command line interface for quickly developing universal web
applications using React. Currently it is still very experimental and is likely
to change frequently.

## Requirements
GlueStick works best with v5+ of node but some people have had success running
it under v4. Versions prior to 4 are not currently supported.

## Install
```
sudo npm install gluestick -g
```

## Getting Started
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
GlueStick sets up a testing environment using Karma, Mocha, Chai and Sinon.
React's TestUtils are also available globally in your test files. You simply
need to create files in the `test` folder with the extension .test.js and they
will be executed through the test runner.

## Styles
The preferred way to style components in the GlueStick environment is to use
[Radium](https://github.com/FormidableLabs/radium).

To prepare a component for using Radium, simply use the @Radium decorator above
your component class. When styling with Radium, your style updates will be hot
loaded in development mode so you do not need to refresh the browser to see
your changes. Please read the Radium docs for more information on how to use
Radium.

Example:
```
@Radium
export default class MyComponent extends Component {
…
```

#### CSS and SASS
If you want to include a base stylesheet (like bootstrap css), you can import
you stylesheet at the top of any file and it will be included when the page
loads. We do not currently support hot loading for these styles but they should
show up on a page refresh. You can use plain css or sass.

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
(src/config/application.js) to define the asset path for production.

[npm-badge]: https://img.shields.io/npm/v/gluestick.svg?style=flat-square
[npm]: https://www.npmjs.org/package/gluestick
