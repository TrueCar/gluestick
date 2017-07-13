jest.mock('fs');
jest.mock('mkdirp');
jest.mock(
  'path/webpack-chunks',
  () => ({
    javascript: {
      main: 'publicPath/main.js',
      profile: 'publicPath/profile.js',
    },
    styles: {
      main: 'publicPath/main.css',
    },
  }),
  { virtual: true },
);

const fs = require('fs');
const ChunksPlugin = require('../ChunksPlugin');

describe('ChunksPlugin', () => {
  it('should create chunks info file', () => {
    const plugin = new ChunksPlugin({ output: { path: 'path' } }, {});
    const doneTap = jest.fn();
    plugin.apply({ plugin: doneTap });
    expect(doneTap).toHaveBeenCalled();
    doneTap.mock.calls[0][1]({
      toJson: () => ({
        publicPath: 'publicPath/',
        assetsByChunkName: {
          main: ['main.js', 'main.css'],
          profile: ['profile.js'],
        },
      }),
    });
    expect(JSON.parse(fs.readFileSync('path/webpack-chunks.json'))).toEqual({
      javascript: {
        main: 'publicPath/main.js',
        profile: 'publicPath/profile.js',
      },
      styles: {
        main: 'publicPath/main.css',
      },
    });
    fs.unlinkSync('path/webpack-chunks.json');
  });

  it('should append new chunks info data to file', () => {
    fs.writeFileSync('path/webpack-chunks', '//');
    const plugin = new ChunksPlugin(
      { output: { path: 'path' } },
      { appendChunkInfo: true, chunkInfoFilename: 'webpack-chunks' },
    );
    const doneTap = jest.fn();
    plugin.apply({ plugin: doneTap });
    expect(doneTap).toHaveBeenCalled();
    doneTap.mock.calls[0][1]({
      toJson: () => ({
        publicPath: 'publicPath/',
        assetsByChunkName: {
          home: ['home.js', 'home.css'],
        },
      }),
    });
    expect(JSON.parse(fs.readFileSync('path/webpack-chunks'))).toEqual({
      javascript: {
        main: 'publicPath/main.js',
        profile: 'publicPath/profile.js',
        home: 'publicPath/home.js',
      },
      styles: {
        main: 'publicPath/main.css',
        home: 'publicPath/home.css',
      },
    });
    fs.unlinkSync('path/webpack-chunks.json');
  });
});
