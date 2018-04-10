# Webpack Bundle Analyzer Guide

Visualize size of webpack output files with an interactive zoomable treemap.

----------

## Output
Create an interactive treemap visualization of the contents of all your bundles.
![Webpack Visualization](./img/webpack.gif)

## How To

1. Navigate to your project root directory
1. Then run:
```
NODE_ENV=production gluestick build -S
mv build/webpack-stats-client.json build/assets
cd build
npx webpack-bundle-analyzer assets/webpack-stats-client.json
```