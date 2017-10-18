# Contributing to GlueStick

GlueStick is an open source project sponsored by TrueCar that uses it to speed up the development process internally in [truecar.com](https://truecar.com) and also help a larger audience reduce the time needed to build apps. It allows the developer to create and deploy enterprise-grade React and Redux application right from your command line.

### Setup

In order to contribute, you need to setup the monorepo locally.

To minimize problems with symlinks, please use [Yarn](https://yarnpkg.com/lang/en/).

1. `git clone https://github.com/TrueCar/gluestick.git`
1. `cd gluestick`
1. `yarn run install:yarn`
1. `yarn global add file:./packages/gluestick-cli` (If you haven't done it already)

Now, your ready to go.

If your contribution requires a GlueStick project to test it, run:
```bash
gluestick new <AppName> --dev <path/to/gluestick/monorepo>
```

For example, if you want to create a project named `TestApp` next to `gluestick` monorepo the command should look:
```bash
gluestick new TestApp --dev ./gluestick
```

Now, from within the project you can run `gluestick watch` to automatically watch for changes in `gluestick` monorepo and apply them to the project.

__Tip__: If you reinstalled `node_modules`, but doesn't see your changes in `gluestick` reflected, it is likely that the old `gluestick` package is cached.
In this case run the following commands:

```bash
yarn cache clean gluestick
rm -rf node_modules
yarn install
```

### Contributing to the codebase

GlueStick consist of multiple separate packages inside single monorepo, which is handled by [Lerna](https://github.com/lerna/lerna).

Here's the outline of the most important packages:

* `./packages/gluestick/` - Main gluestick package, which is installed locally as a project dependency.
* `./packages/gluestick-cli/` - Global CLI wrapper over `gluestick`, used to create a new project and spawn internal commands from `gluestick`.

All of the source code lives under `src/` directory of each package, which later is transpiled to `build/` folder.
You can trigger the build by running `yarn run build` in __monorepo directory__.

Before making a PR, run the following commands to ensure that there are not lint/flow errors and the tests are passing:
```bash
yarn run lint
yarn run flow
yarn run test
```

### Contributing to the documentation

All of the documentation lives inside `docs/` directory, which later is processed by [GitBook](https://github.com/GitbookIO/gitbook).

You can run development GitBook server by running `yarn run docs:watch`, then open `http://localhost:4000`.

### Pull Requests

**You can submit your pull request to the `next` branch**.

Before submitting a pull request, please make sure the following is done…

1. Fork the repo and create your branch from `next`.
2. **Describe your test plan in your commit.** If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation (`docs` folder).
4. Ensure tests, lints and flow-check pass on *Circle CI*.
5. Squash your commits (`git rebase -i`).
   One intent along with one commit makes it clearer for people to review and easier to understand your intention.

### Contributor License Agreement (CLA)

In your fist PR you will be asked to sing our CLA.

## Style Guide

### Code

#### General

* **Most important: Look around.** Match the style you see used in the rest of the project. For the formatting we use [Prettier](https://github.com/prettier/prettier) integrated into [ESLint](https://eslint.org/).

#### JavaScript

* We are using extended `eslint-config-airbnb` - make sure your code doesn't result in any lint errors.
* We are also using [FlowType](https://flowtype.org/) for static type checking - make sure your code doesn't produce any flow errors.
* No `Object`, `Function` and `any | *` types are allowed (except for edge cases) - make sure all types have detailed description.
* When writing CLI we use `CommonJS` to handle import/export - please do not mix them with ES6 imports. The only exception are Flow types where we use ES6 imports.

### Documentation

* Do not wrap lines at 80 characters - configure your editor to soft-wrap when editing documentation.

## Issues

We are using GitHub Issues for our public bugs. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn't already exist.

# Git flow

`next` -> `staging`

* All new features, enhancements and contributions go to `next`
* We cut release candidates using git tags from `staging`
  * QA and testing are done on `staging`  
  * High priority bugs are worked on `staging`. Once the PR is reviewed and merged, then we open another PR that `cherry-pick` those changes into `next`
