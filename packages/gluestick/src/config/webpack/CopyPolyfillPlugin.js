const fs = require('fs');
const path = require('path');

const polyfillContent = fs.readFileSync(
  path.join(process.cwd(), 'node_modules/babel-polyfill/dist/polyfill.min.js'),
);

module.exports = class CopyPolyfillPlugin {
  constructor(opts) {
    this.outputPath = opts.outputPath;
    this.chunksFilename = path.join(this.outputPath, 'webpack-chunks.json');
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const { publicPath } = stats.toJson();
      fs.writeFileSync(
        path.join(this.outputPath, 'polyfill.min.js'),
        polyfillContent,
      );
      process.nextTick(() => {
        const chunks = require(this.chunksFilename);
        chunks.javascript.polyfill = `${publicPath}polyfill.min.js`;
        fs.writeFileSync(
          this.chunksFilename,
          JSON.stringify(chunks, null, '  '),
        );
      });
    });
  }
};
