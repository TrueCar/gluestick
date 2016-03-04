var webpack = require("webpack");

module.exports = {
  devtool: "source-map",

  entry: {
    "gluestick-shared": "./src/index.js"
  },

  output: {
    path: "./build",
    filename: "index.js",
    library: "gluestick-shared",
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
      { 
        test: /\.js/, 
        loader: "babel", 
        query: {
          presets: [
            "react",
            "es2015", 
            "stage-0"
          ]
        },
        exclude: /node_modules/ 
      }
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
      }
    }
  ]
};

