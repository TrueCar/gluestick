# GlueStick
GlueStick is a command line interface for quickly developing universal web
applications using React. Currently it is still very experimental and is likely
to change frequently.

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

## Hot Loading
GlueStick's development environment utilizing hotloading so your changes will
show up in the browser as you go. This is sort of experimental but it works
great most of the time. However, sometimes you will still need to refresh the
browser for certain changes.

## Deployment & Production
This is not finished yet but we have some cool things in the works. Stay tuned
for more.

