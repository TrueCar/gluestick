# Code quality

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
