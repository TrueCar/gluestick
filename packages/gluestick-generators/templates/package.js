/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templatePackage = createTemplate`
{
  "name": "${(args) => args.appName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "gluestick start",
    "test": "gluestick test",
    "flow": "flow",
    "lint": "eslint src"
  },
  "dependencies": {
    "babel-core": "6.22.1",
    "babel-loader": "6.2.10",
    "babel-plugin-gluestick": "0.0.1",
    "babel-plugin-transform-decorators-legacy": "1.3.4",
    "babel-preset-es2015": "6.22.0",
    "babel-preset-react": "6.22.0",
    "babel-preset-stage-0": "6.22.0",
    "css-loader": "0.27.3",
    "extract-text-webpack-plugin": "2.1.0",
    "file-loader": "0.9.0",
    ${(args) => Object.keys(args.gluestickDependencies).reverse().reduce(
      (prev, key, i, arr) => prev.concat(
        `"${key}": "${args.gluestickDependencies[key]}",${i === arr.length - 1 ? '' : '\n    '}`,
      ),
      '',
    )}
    "image-webpack-loader": "3.3.0",
    "normalize.css": "^5.0.0",
    "react": "15.4.2",
    "react-dom": "15.4.2",
    "react-helmet": "4.0.0",
    "react-hot-loader": "^3.0.0-beta.6",
    "react-redux": "5.0.2",
    "react-router": "3.0.2",
    "redux": "3.6.0",
    "sass-loader": "6.0.3",
    "style-loader": "0.16.1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-eslint": "7.1.1",
    "babel-jest": "18.0.0",
    "babel-plugin-react-transform": "2.0.2",
    "enzyme": "2.7.1",
    "eslint": "3.14.1",
    "eslint-plugin-react": "6.9.0",
    "flow-bin": "0.44.2",
    "flow-typed": "^2.0.0",
    "react-addons-test-utils": "15.4.2",
    "react-hot-loader": "1.3.1",
    "react-transform-catch-errors": "1.0.2",
    "react-transform-hmr": "1.0.4",
    "redbox-react": "1.3.3",
    "webpack-hot-middleware": "2.15.0"
  }
}
`;

module.exports = ({ gluestickDependencies, appName }) => ({
  entries: [
    {
      path: '/',
      filename: 'package.json',
      template: templatePackage,
      args: {
        gluestickDependencies,
        appName,
      },
    },
  ],
});
