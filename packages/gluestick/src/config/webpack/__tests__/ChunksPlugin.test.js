jest.mock('fs');
jest.mock('mkdirp');
jest.mock(
  'path/webpack-chunks',
  () => ({
    javascript: {
      main: { name: 'main.js', url: 'publicPath/main.js' },
      profile: { name: 'profile.js', url: 'publicPath/profile.js' },
    },
    styles: {
      main: { name: 'main.css', url: 'publicPath/main.css' },
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
        main: { name: 'main.js', url: 'publicPath/main.js' },
        profile: { name: 'profile.js', url: 'publicPath/profile.js' },
      },
      styles: {
        main: { name: 'main.css', url: 'publicPath/main.css' },
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
        main: { name: 'main.js', url: 'publicPath/main.js' },
        profile: { name: 'profile.js', url: 'publicPath/profile.js' },
        home: { name: 'home.js', url: 'publicPath/home.js' },
      },
      styles: {
        main: { name: 'main.css', url: 'publicPath/main.css' },
        home: { name: 'home.css', url: 'publicPath/home.css' },
      },
    });
    fs.unlinkSync('path/webpack-chunks.json');
  });
});
