/* @flow */
import type { ChunksInfo, ChunkInfo, WebpackConfig } from '../../types';

const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');

const chunkInfoFilePath = (
  webpackConfiguration: WebpackConfig,
  chunkInfoFilename?: string = 'webpack-chunks.json',
): string => {
  // $FlowIgnore `output` is a Object
  return path.join(webpackConfiguration.output.path, chunkInfoFilename);
};

const getChunksInfoBody = (stats: Object, publicPath: string): ChunksInfo => {
  const assetsByChunk = stats.assetsByChunkName;

  const assetsChunks: ChunksInfo = {
    javascript: {},
    styles: {},
  };

  // gets asset paths by name and extension of their chunk
  const getAssets = (chunkName: string, extension: string): ChunkInfo[] => {
    let chunk: string | string[] = stats.assetsByChunkName[chunkName];

    // a chunk could be a string or an array, so make sure it is an array
    if (!Array.isArray(chunk)) {
      chunk = [chunk];
    }

    return chunk
      .filter(name => path.extname(name) === `.${extension}`)
      .map(name => ({ url: `${publicPath}${name}`, name }));
  };

  Object.keys(assetsByChunk).forEach((name: string) => {
    // The second asset is usually a source map
    const jsAsset = getAssets(name, 'js')[0];

    if (jsAsset) {
      assetsChunks.javascript[name] = jsAsset;
    }

    const styleAsset = getAssets(name, 'css')[0];

    if (styleAsset) {
      assetsChunks.styles[name] = styleAsset;
    }
  });

  return assetsChunks;
};

module.exports = class ChunksPlugin {
  configuration: WebpackConfig;
  options: {
    appendChunkInfo?: boolean,
    chunkInfoFilename?: string,
  };

  constructor(configuration: WebpackConfig, options: Object = {}) {
    // Webpack configuration from `compiler` has wrong `output.path`,
    // so it has to be passed when constructing an instance
    this.configuration = configuration;
    this.options = options;
  }

  apply(compiler: Object): void {
    const outputFilePath = chunkInfoFilePath(
      this.configuration,
      this.options.chunkInfoFilename,
    );

    compiler.plugin('done', (stats: Object) => {
      const json = stats.toJson({
        context: this.configuration.context || process.cwd(),
        chunkModules: true,
      });

      const publicPath =
        process.env.NODE_ENV !== 'production' &&
        this.configuration.devServer &&
        typeof this.configuration.devServer.publicPath === 'string'
          ? this.configuration.devServer.publicPath
          : json.publicPath;

      const chunksInfoFile: ChunksInfo = getChunksInfoBody(json, publicPath);

      let outputChunkInfo: ChunksInfo = chunksInfoFile;
      if (this.options.appendChunkInfo && fs.existsSync(outputFilePath)) {
        const existingChunkInfoFile = require(outputFilePath);
        outputChunkInfo = {
          javascript: {
            ...existingChunkInfoFile.javascript,
            ...chunksInfoFile.javascript,
          },
          styles: {
            ...existingChunkInfoFile.styles,
            ...chunksInfoFile.styles,
          },
        };
      }
      mkdir.sync(path.dirname(outputFilePath));
      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(outputChunkInfo, null, '  '),
      );
    });
  }
};
