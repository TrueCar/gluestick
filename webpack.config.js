module.exports = {
    devtool: "source-map",

    entry: {
        "cweb": "./src/index.js"
    },

    output: {
        path: "./build",
        filename: "index.js",
        library: "cweb",
        libraryTarget: "umd"
    },

    module: {
        loaders: [
            { test: /\.js/, loader: "babel", exclude: /node_modules/ }
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
            }
        }
    ]
};

