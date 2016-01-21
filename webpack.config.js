var webpack = require("webpack");

module.exports = {
  devtool: "source-map",

  entry: {
    "gluestick": "./src/index.js"
  },

  output: {
    path: "./build",
    filename: "index.js",
    library: "gluestick",
    libraryTarget: "umd"
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
  ],

  module: {
    loaders: [
      { test: /\.js/, loader: "babel?stage=0", exclude: /node_modules/ }
    ]
  },

  externals: [
    {
      react: {
        root: "React",
        commonjs2: "react",
        comonjs: "react",
        amd: "react"
      },
      radium: {
        root: "Radium",
        commonjs2: "radium",
        comonjs: "radium",
        amd: "radium"
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom"
      },
      "react-router": {
        root: "ReactRouter",
        commonjs2: "react-router",
        commonjs: "react-router",
        amd: "react-router"
      },
      redux: {
        root: "redux",
        commonjs2: "redux",
        commonjs: "redux",
        amd: "redux"
      },
      "react-redux": {
        root: "ReactRedux",
        commonjs2: "react-redux",
        commonjs: "react-redux",
        amd: "react-redux"
      },
      "history/lib/createBrowserHistory": {
        root: "history/lib/createBrowserHistory",
        commonjs2: "history/lib/createBrowserHistory",
        commonjs: "history/lib/createBrowserHistory",
        amd: "history/lib/createBrowserHistory"
      }
    }
  ]
};

