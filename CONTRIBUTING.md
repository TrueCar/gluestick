# Contributing to GlueStick

GlueStick is one of TrueCar's open source projects that is build to speed up the development process internally in [truecar.com](https://truecar.com) and also help a larger audience reduce the time needed to build apps. It allows the developer to create and deploy enterprise-grade React and Redux application right from your command line.

### Pull Requests

TrueCar team will be monitoring for pull requests.

**You can submit your pull request on the `develop` branch**.

Before submitting a pull request, please make sure the following is done…

1. Fork the repo and create your branch from `develop`.
2. **Describe your test plan in your commit.** If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure tests, lints and flow-check pass on *Circle CI*.
5. Ensure that *Node Security* check passed.
6. Squash your commits (`git rebase -i`).
   one intent alongs with one commit makes it clearer for people to review and easier to understand your intention.

### Contributor License Agreement (CLA)

TODO: @toddw

## Issues

### Where to Find

We are using GitHub Issues for our public bugs. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn't already exist.


## Style Guide

### Code

#### General

* **Most important: Look around.** Match the style you see used in the rest of the project. This includes formatting, naming things in code, naming things in documentation.
* Add trailing commas,
* 2 spaces for indentation (no tabs)

#### JavaScript

* We are using extended `eslint-config-airbnb` - make sure your code doesn't result in any lint errors.
* We are also using [FlowType](https://flowtype.org/) for static type checking - make sure your code doesn't produce any flow errors.
* No `Object` or `Function` types are allowed (except for edge cases) - make sure all types have detailed description.
* When writing CLI we use `CommonJS` to handle import/export - please do not mix them with ES6 imports (only exception is importing types).

### Documentation

* Do not wrap lines at 80 characters - configure your editor to soft-wrap when editing documentation.

## License

TODO: @toddw
