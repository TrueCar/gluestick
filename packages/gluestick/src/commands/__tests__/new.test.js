/* eslint-disable */
// @TODO enable eslint when file is refactored

// process.cwd = jest.fn().mockReturnValue('test/mock/path');

jest.mock('../../src/generator');

// jest.setMock('test/mock/path/package.json', {
//   dependencies: {
//     gluestick: '*'
//   }
// });

   import fs from 'fs';
   import temp from 'temp';
   import rimraf from 'rimraf';
// import glob from 'glob';
   import inquirer from 'inquirer';
   import newCommand from '../../src/commands/new';
   import generate from '../../src/generator';
   //const  currentlyInProjectFolder  = require ('../../src/commands/new');
//
const cliColorScheme = require('../../src/cli/colorScheme');
//
const { highlight, filename } = cliColorScheme;
// const newFilesTemplate = glob.sync('**', {
//   cwd: path.resolve('./templates/new'),
//   dot: true,
// });

describe('cli: gluestick new', () => {
  let originalCwd;
  let tmpDir;

  const logger = jest.fn();
  logger.info = jest.fn();
  logger.warn = jest.fn();
  module.parent.createTemplate = jest.fn();
  //inquirer.prompt = () => Promise.resolve({ confirm: false });
 
  // const currentlyInProjectFolder = jest.fn();
  // const generateTemplate = jest.fn();

  beforeEach(() => {
    originalCwd = process.cwd();
    tmpDir = temp.mkdirSync('gluestick-new');
    process.chdir(tmpDir);
  });

  afterEach((done) => {
    jest.resetAllMocks();
    process.chdir(originalCwd);
    rimraf(tmpDir, done);
  });

  // it('should report an error if the project name has symbols', () => {
  //   newApp('foo#$');
  //   expect(logger.warn.mock.calls[0][0]).toContain('Invalid name');
  // });

  // it('should prompt the user if a .gluestick file already exists', () => {
  //   fs.closeSync(fs.openSync('.gluestick', 'w'));
  //   newApp('gs-new-test');
  //   expect(logger.info.mock.calls[0][0]).toContain('You are about to initialize a new gluestick project');
  // });

  // it('should copy the contents of `new` upon install', () => {
  //   newApp('gs-new-test');

  //   // account for the fact that the gitignore file that gets renamed
  //   const generatedFiles = new Set(glob.sync('**', { dot: true }));
  //   const renamedGitFileExists = generatedFiles.delete('.gitignore');
  //   expect(renamedGitFileExists).toBeTruthy();
  //   generatedFiles.add('_gitignore');

  //   expect(newFilesTemplate.filter(f => !generatedFiles.has(f)).length).toBe(0);
  // });

  // it('should generate a test for all of the initial components and containers', () => {
  //   newApp('gs-new-test');

  //   const generatedFiles = new Set(glob.sync('**', { dot: true }));

  //   // create index from array so we can quickly lookup files by name
  //   const index = {};
  //   generatedFiles.forEach((file) => {
  //     index[file] = true;
  //   });

  //   // loop through and make sure components and containers all have tests
  //   // written for them. This will help us catch if we add a component or
  //   // container but we do not add a test.
  //   generatedFiles.forEach((file) => {
  //     if (/^src\/(components|containers).*\.js$/.test(file)) {
  //       const testFilename = file.replace(/^src\/(.*)\.js$/, 'test/$1.test.js');
  //       expect(index[testFilename]).toEqual(true);
  //     }
  //   });
  // });

  // it('logs a successful message if everything ran correctly', () => {
  //   newApp('gs-new-test');

  //   expect(logger.info).toHaveBeenCalledTimes(5);

  //   const pathToFile = filename(`${process.cwd()}/gs-new-test`);

  //   expect(logger.info.mock.calls[0][0]).toContain(
  //     `${highlight('New GlueStick project created')} at ${pathToFile}`,
  //   );
  //   expect(logger.info.mock.calls[1][0]).toEqual('To run your app and start developing');
  //   expect(logger.info.mock.calls[2][0]).toEqual('    cd gs-new-test');
  //   expect(logger.info.mock.calls[3][0]).toEqual('    gluestick start');
  //   expect(logger.info.mock.calls[4][0]).toEqual('    Point the browser to http://localhost:8888');
  // });

  // it('should report an error if the project name has symbols', () => {
  //   newApp({ logger: logger })
  //   expect(logger.warn.mock.calls[0][0]).toContain('Invalid name');
  // });






// 2. if we have package - prompt should be called
// 3. if confirm = true generator should be called
// 4. if confirm = false generator should not be called
// 5. if we dont have package - generator calls without prompt 
// 6. ... ? 

  
  // @TODO needs to be fixed
  it.skip('if new app has package.json prompt should be called', async () => {
    inquirer.prompt = jest.fn().mockImplementation(() => Promise.resolve({ confirm: true }));
    newCommand({
      logger 
    });
    expect(logger.info.mock.calls[0][0]).toContain('You are about to initialize a new gluestick project');
  });

  it('calls generate with correct params', () => {
    newCommand({
      logger 
    }, 'gs-new-test');
    expect(generate).toBeCalledWith({
      generatorName: 'new',
      entityName: 'gs-new-test',
    }, logger);
  });

  it('logs a successful message if everything ran correctly', () => {
    newCommand({
      logger 
    }, 'gs-new-test');

    expect(logger.info).toHaveBeenCalledTimes(5);

    const pathToFile = filename(`${process.cwd()}`);

    expect(logger.info.mock.calls[0][0]).toContain(
      `${highlight('New GlueStick project created')} at ${pathToFile}`,
    );
    expect(logger.info.mock.calls[1][0]).toEqual('To run your app and start developing');
    expect(logger.info.mock.calls[2][0]).toEqual('    cd gs-new-test');
    expect(logger.info.mock.calls[3][0]).toEqual('    gluestick start');
    expect(logger.info.mock.calls[4][0]).toEqual('    Point the browser to http://localhost:8888');
  });


});
