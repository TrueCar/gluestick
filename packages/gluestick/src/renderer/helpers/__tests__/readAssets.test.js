/* @flow */
jest.mock('fs');
const readAssets = require('../readAssets');
const fs = require('fs');

const originalProcessCwd = process.cwd.bind(process);
// $FlowIgnore
process.cwd = () => 'cwd';
const originaNodeEnv = process.env.NODE_ENV;

describe('renderer/helpers/readAssets', () => {
  beforeEach(() => {
    process.env.NODE_ENV = originaNodeEnv;
  });

  afterAll(() => {
    // $FlowIgnore
    process.cwd = originalProcessCwd;
  });

  it('should read and return assets', done => {
    fs.readFile = (filename, cb) => {
      // $FlowIgnore
      cb(
        null,
        new Buffer(
          JSON.stringify({
            javascript: {
              main: 'path',
            },
          }),
        ),
      );
    };
    readAssets('assets').then(assets => {
      expect(assets).toEqual({ javascript: { main: 'path' } });
      done();
    });
  });

  it('should assets from cache in production', done => {
    process.env.NODE_ENV = 'production';
    let called = 0;
    fs.readFile = (filename, cb) => {
      called++;
      // $FlowIgnore
      cb(
        null,
        new Buffer(
          called === 1
            ? JSON.stringify({
                javascript: {
                  main: 'path',
                },
              })
            : '{}',
        ),
      );
    };
    readAssets('assets')
      .then(() => {
        return readAssets('assets');
      })
      .then(assets => {
        expect(assets).toEqual({ javascript: { main: 'path' } });
        done();
        process.env.NODE_ENV = originaNodeEnv;
      });
  });

  it('should reject promise', done => {
    fs.readFile = (filename, cb) => {
      // $FlowIgnore
      cb(new Error('test'));
    };
    readAssets('not/found').catch(error => {
      expect(error.message).toEqual('test');
      done();
    });
  });
});
