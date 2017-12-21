jest.mock('cwd1/package.json', () => ({ scripts: {} }), { virtual: true });
jest.mock(
  'cwd2/package.json',
  () => ({ scripts: { postinstall: 'run-some-cli' } }),
  { virtual: true },
);
jest.mock(
  'cwd3/package.json',
  () => ({ scripts: { postinstall: 'gluestick auto-upgrade' } }),
  { virtual: true },
);
jest.mock('fs', () => ({ writeFileSync: jest.fn() }));

const fs = require('fs');
const appendPostinstallScript = require('../appendPostinstallScript');

const processCwd = process.cwd.bind(process);

describe('autoUpgrade/appendPostinstallScript', () => {
  beforeEach(() => {
    process.cwd = processCwd;
    fs.writeFileSync.mockClear();
  });

  it('should create postinstall script', () => {
    process.cwd = () => 'cwd1';

    appendPostinstallScript();

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(
      JSON.parse(fs.writeFileSync.mock.calls[0][1]).scripts.postinstall,
    ).toEqual('gluestick auto-upgrade');
  });

  it('should append to postinstall script', () => {
    process.cwd = () => 'cwd2';

    appendPostinstallScript();

    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(
      JSON.parse(fs.writeFileSync.mock.calls[0][1]).scripts.postinstall,
    ).toEqual('run-some-cli && gluestick auto-upgrade');
  });

  it('should do nothing', () => {
    process.cwd = () => 'cwd3';

    appendPostinstallScript();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
