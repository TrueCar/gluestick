# Code quality

### Tests

GlueStick sets up a testing environment using [Jest](https://facebook.github.io/jest/) and [Enzyme](https://github.com/airbnb/enzyme).

To add tests, create a file in any `__tests__` directory with the extension `.test.js` and its tests
will be executed through the test runner using:
```
npm test
```

The convention is colocate your `__tests__` folder with the file it’s testing, and use the same
naming for tests as the files that they test.

```
- src
  - components
    - MyComponent.js
    - __tests__
      - MyComponent.test.js
```

Tests can also be typed using `Flow` (see below). We use [flow-typed](https://github.com/flowtype/flow-typed) for Jest under the hood.

#### Debugging tests

If you're using node 8.4.0+ you can also debug you test - just add `-D`:

```bash
gluestick test -D
```

Then you can use, for instance, **Node.js V8 --inspector Manager (NiM)** to debug them in Chrome.

We recommend adding `"sourceMaps": "inline"` to your `.babelrc` for better developer experience.

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

### Environment details

You can read more about environment details [here](./configuration/EnvDetails.md).
