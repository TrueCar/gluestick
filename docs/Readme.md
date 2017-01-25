GlueStick
=========

Create and deploy enterprise-grade React and Redux application right from your command line. Gluestick is a combination
of `create-react-app` and `next.js` that is backed and used in production by TrueCar.

### tl;dr

```bash
$ npm install gluestick -g

gluestick new myapp
cd ./myapp
gluestick start
```

Then open your localhost to see the app. When ready working, check out the rest of documentation to see how
you can quickly dockerize the app and deploy it wherever you want.

## Getting started

### Installation

Install it once globally:

```bash
$ npm install -g gluestick
```

You will need to have Node >= v6 on your machine. Earlier versions are [not currently supported](https://github.com/TrueCar/gluestick/issues/322).
You can use [nvm](https://github.com/creationix/nvm#usage) to easily switch Node versions between different projects.