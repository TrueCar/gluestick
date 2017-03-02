# Generators
To help speed up development, GlueStick includes generators for common types of
files. For Gluestick provided generators, you can also provide an entry point
`-E` where the files should be included: `shared` or `apps/${appName}`. If you
 do not provide one, `apps/main` will be used.

### App Generator
The app generator will create new folder structure for a new app.

Example:
```
gluestick generate app some-name
```

### Container Generator
The container generator will create a basic React component in the containers folder that is
already hooked up to redux using the `@connect` middleware.

Example:
```
gluestick generate container MyContainer -E shared
```

### Component Generator
The component generator will create a basic React component and a starting test
file for that component.

Example:
```
gluestick generate component MyComponent
```

### Reducer Generator
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
