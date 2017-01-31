/* global afterEach beforeEach describe it*/
import fs from 'fs';
import path from 'path';
import temp from 'temp';
import rimraf from 'rimraf';
import logger from '../../src/lib/cliLogger';
import updateLastVersionUsed from '../../src/lib/updateVersion';


describe('cli: gluestick touch', () => {
  let originalCwd,
    tmpDir,
    dotFile;

  const newDotFileContents = function (contents) {
    fs.writeFileSync(dotFile, contents);
  };

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-touch');
    process.chdir(tmpDir);
    fs.closeSync(fs.openSync('.gluestick', 'w'));
    dotFile = path.join(tmpDir, '.gluestick');

    logger.warn = jest.fn();
    process.exit = jest.fn();
  });

  afterEach((done) => {
    jest.resetAllMocks();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  it('does not error if the old "DO NOT MODIFY" header is in the .gluestick file', () => {
    const gluestickVersion = '0.1.0';
    newDotFileContents('DO NOT MODIFY\n');
    updateLastVersionUsed(gluestickVersion);
    expect(logger.warn).not.toBeCalled();
  });

  it('displays a warning when the project version is greater than the gluestick version', () => {
    const projectVersion = '0.2.0';
    const gluestickVersion = '0.1.0';
    newDotFileContents(JSON.stringify({ version: projectVersion }));
    updateLastVersionUsed(gluestickVersion);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('exits when the project version is greater than the gluestick version', () => {
    const projectVersion = '0.2.0';
    const gluestickVersion = '0.1.0';
    newDotFileContents(JSON.stringify({ version: projectVersion }));
    updateLastVersionUsed(gluestickVersion);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });

  it('does not display a warning when the flag is set to false', () => {
    const projectVersion = '0.2.0';
    const gluestickVersion = '0.1.0';
    newDotFileContents(JSON.stringify({ version: projectVersion }));
    updateLastVersionUsed(gluestickVersion, false);
    expect(logger.warn).toHaveBeenCalledTimes(0);
  });

  it('does not display a warning when the project version is less than the gluestick version', () => {
    const projectVersion = '0.1.0';
    const gluestickVersion = '0.2.0';
    newDotFileContents(JSON.stringify({ version: projectVersion }));
    updateLastVersionUsed(gluestickVersion);
    expect(logger.warn).toHaveBeenCalledTimes(0);
  });

  it('removes the "DO NOT MODIFY" header from the .gluestick file', () => {
    const projectVersion = '0.1.0';
    const gluestickVersion = '0.1.0';
    newDotFileContents(`DO NOT MODIFY\n${JSON.stringify({ version: projectVersion })}`);
    updateLastVersionUsed(gluestickVersion);
    const fileContents = fs.readFileSync(dotFile, { encoding: 'utf8' });
    expect(fileContents.indexOf('DO NOT MODIFY')).toEqual(-1);
  });

  it('updates the project version to current gluestick version', () => {
    const projectVersion = '0.1.0';
    const gluestickVersion = '0.2.0';
    newDotFileContents(JSON.stringify({ version: projectVersion }));
    updateLastVersionUsed(gluestickVersion);
    const fileContents = fs.readFileSync(dotFile, { encoding: 'utf8' });
    const project = JSON.parse(fileContents);
    expect(project.version).toEqual(gluestickVersion);
  });
});
