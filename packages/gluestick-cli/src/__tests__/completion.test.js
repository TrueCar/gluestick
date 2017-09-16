/* @flow */

jest.mock('fs', () => {
  // $FlowIgnore:
  const _fs = require.requireActual('fs');
  _fs.existsReturn = false;
  _fs.existsSync = function _() {
    return _fs.existsReturn;
  };
  return _fs;
});
const fs = require('fs');

jest.mock(
  'node_modules/gluestick/package.json',
  () => ({ version: '1.14.0' }), // enable the check for updated local dependency
  { virtual: true },
);
jest.mock(
  'node_modules/gluestick/build/cli',
  () => require('../../../gluestick/src/cli'),
  { virtual: true },
);
const entriesJson = {
  '/app1Path': {
    name: 'app1',
  },
  '/app2Path2': {
    name: 'app2',
  },
};
jest.mock('src/entries.json', () => entriesJson, { virtual: true });
const completion = require('../completion');

const cliTab = (line, cwd = '.') => {
  const argvMimic = line.replace(/^gluestick /, '').trim();
  // console.log("argv mimic:", argvMimic.split(" "));
  return completion.default(cwd, argvMimic ? argvMimic.split(' ') : []);
};

const CLI_COMMANDS = ['new', 'reinstall-dev', 'reset-hard', 'watch'];

const PROJECT_COMMANDS = [
  'auto-upgrade',
  'bin',
  'build',
  'destroy',
  'dockerize',
  'generate',
  'start',
  'start-client',
  'start-server',
  'test',
];

describe('gluestick-cli/src/completion.js', () => {
  it('should be callable', () => {
    completion.default('.', []);
  });

  describe('when CWD is a project with gluestick < 1.14', () => {
    beforeAll(() => {
      const projectPDJ = require('node_modules/gluestick/package.json');
      projectPDJ.version = '1.13';
      completion.reload();
      // $FlowIgnore:
      fs.existsReturn = true; // ./node_modules/.bin/gluestick exists
    });
    it('should return base commands anyway', () => {
      const options = cliTab('gluestick ');
      expect(options).toEqual(expect.arrayContaining(PROJECT_COMMANDS));
    });
  });
  describe('when CWD is a gluestick project', () => {
    beforeAll(() => {
      // $FlowIgnore:
      const projectPDJ = require('node_modules/gluestick/package.json');
      projectPDJ.version = '1.14';
      completion.reload();
      // $FlowIgnore:
      fs.existsReturn = true; // ./node_modules/.bin/gluestick exists
    });
    it('should return global commands', () => {
      const options = cliTab('gluestick ');
      expect(options).toEqual(PROJECT_COMMANDS);
    });
    it('should return options while typeing the base command', () => {
      const options = cliTab('gluestick s');
      expect(options).toEqual(PROJECT_COMMANDS);
    });

    describe('completing gluestick start', () => {
      it('completes flags', () => {
        const options = cliTab('gluestick start ');
        expect(options).toEqual([
          '-T',
          '--run-tests',
          '-C',
          '--coverage',
          '-E',
          '--entrypoints',
          '-A',
          '--app',
          '-L',
          '--log-level',
          '-D',
          '--debug-server',
          '-p',
          '--debug-port',
          '-P',
          '--skip-build',
          '-S',
          '--skip-dep-check',
        ]);
      });

      it('completes entry points', () => {
        const options = cliTab('gluestick start -E ');
        const options2 = cliTab('gluestick start -A ');
        expect(options2).toEqual(options);
        const options3 = cliTab('gluestick start -A a');
        expect(options3).toEqual(options);
        expect(options).toEqual(
          Object.keys(entriesJson).map(appPath => entriesJson[appPath].name),
        );
      });
    });

    describe('completing gluestick generate', () => {
      it('completes arguments', () => {
        const options = cliTab('gluestick generate ');
        const options2 = cliTab('gluestick generate c');
        expect(options2).toEqual(options);
        expect(options).toEqual([
          'container',
          'component',
          'reducer',
          'generator',
        ]);
      });
      it('completes flags', () => {
        const options = cliTab('gluestick generate container ');
        const options2 = cliTab('gluestick generate reducer ');
        expect(options2).toEqual(options);
        const options3 = cliTab('gluestick generate generator ');
        expect(options3).toEqual(options);
        const options4 = cliTab('gluestick generate container -');
        expect(options4).toEqual(options);
        expect(options).toEqual([
          '-E',
          '--entrypoint',
          '-A',
          '--app',
          '-O',
          '--gen-options',
        ]);
      });
      it('completes component flags', () => {
        const options = cliTab('gluestick generate component ');
        const options2 = cliTab('gluestick generate component -');
        expect(options2).toEqual(options);
        const options3 = cliTab('gluestick generate -');
        expect(options3).toEqual(options);
        expect(options).toEqual([
          '-E',
          '--entrypoint',
          '-A',
          '--app',
          '-F',
          '--functional', // but only for "component"
          '-O',
          '--gen-options',
        ]);
      });

      it('completes entry points', () => {
        const options = cliTab('gluestick generate component -E ');
        const options2 = cliTab('gluestick generate component -A ');
        expect(options2).toEqual(options);
        const options3 = cliTab('gluestick generate -A ');
        expect(options3).toEqual(options);
        const options4 = cliTab('gluestick generate -E ');
        expect(options4).toEqual(options);
        const options5 = cliTab('gluestick generate -E a');
        expect(options5).toEqual(options);
        expect(options).toEqual(
          Object.keys(entriesJson).map(appPath => `apps${appPath}`),
        );
      });
    });
  });

  describe('when CWD is _not_ a gluestick project', () => {
    beforeEach(() => {
      // $FlowIgnore:
      fs.existsReturn = false; // ./node_modules/.bin/gluestick absent
    });
    it('should return project commands', () => {
      const options = cliTab('gluestick ');
      expect(options).toEqual(CLI_COMMANDS);
    });

    describe('completing gluestick new', () => {
      const flags = ['-d', '--dev', '-s', '--skip-main', '-n', '--npm'];
      it('expects appname argument', () => {
        const options = cliTab('gluestick new ');
        expect(options).toEqual([]);
      });
      it('completes flags', () => {
        const options = cliTab('gluestick new -');
        expect(options).toEqual(flags);
      });
      it('does not suggest previous option', () => {
        const options = cliTab('gluestick new -s ');
        expect(options).toEqual(['-d', '--dev', '-n', '--npm']);
      });
      it('completes flags after appname is specified', () => {
        const options = cliTab('gluestick new appyapp ');
        expect(options).toEqual(flags);
      });
      it('expects value after -d', () => {
        const options = cliTab('gluestick new appyapp -d ');
        expect(options).toEqual([]);
      });
    });
  });
});
