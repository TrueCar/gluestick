/* @flow */

import type { CommandAPI, Logger } from '../types.js';

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const cliColorScheme = require('../cli/colorScheme');
const {
  isValidEntryPoint,
  convertToCamelCaseWithPrefix,
  convertToCamelCase,
  convertToPascalCase,
} = require('../utils');

const { highlight, filename } = cliColorScheme;

const availableCommands = {
  container: 'containers',
  component: 'components',
  reducer: 'reducers',
};

type Command = 'container' | 'component' | 'reducer';

type Options = {
  entrypoint?: string,
  app?: string,
};

module.exports = async (
  { getLogger, getOptions }: CommandAPI,
  commandArguments: any[],
) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  const command: Command = commandArguments[0];
  const name: string = commandArguments[1];
  const options: Options = getOptions(commandArguments);

  // Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    logger.error(`${highlight(command)} is not a valid destroy command.`);
    logger.info(
      `Available destroy commands: ${Object.keys(availableCommands)
        .map(c => highlight(c))
        .join(', ')}`,
    );
    return;
  }

  const entrypoint = options.entrypoint || options.app || 'apps/main';
  if (!isValidEntryPoint(entrypoint, logger)) {
    return;
  }

  const dirname: string = path.dirname(name);
  const basename: string = path.basename(name);

  if (/\W/.test(basename)) {
    logger.error(`${highlight(basename)} is not a valid name.`);
    return;
  }

  // Possibly mutate the name by converting it to Pascal Case
  // (only for container and component for now)
  const originalName: string = basename; // store original name for later
  let generatedFileName: string = basename;
  if (['container', 'component'].indexOf(command) !== -1) {
    generatedFileName = convertToPascalCase(generatedFileName);
  }
  if (['reducer', 'action-creator'].indexOf(command) !== -1) {
    generatedFileName = convertToCamelCase(generatedFileName);
  }

  // Remove the file
  const CWD: string = process.cwd();
  const generateRoot: string = path.join(
    CWD,
    'src',
    entrypoint,
    availableCommands[command],
  );
  const destinationRoot: string = path.resolve(generateRoot, dirname);
  const destinationPath: string = path.join(
    destinationRoot,
    `${generatedFileName}.js`,
  );
  let fileExists: boolean = true;
  try {
    fs.statSync(destinationPath);
  } catch (e) {
    fileExists = false;
  }

  if (fileExists) {
    // If they typed a name that would normally be mutated,
    // check with the user first before deleting the files
    if (originalName !== generatedFileName) {
      const question = {
        type: 'confirm',
        name: 'confirm',
        message:
          `You wanted to destroy ${filename(
            originalName,
          )} but the generated name is ` +
          `${filename(generatedFileName)}.\nWould you like to continue with ` +
          `destroying ${filename(generatedFileName)}?`,
      };
      // @NOTE: We are using await so that we can wait for the result
      // of the promise before moving on
      const answers = await inquirer.prompt([question]);
      if (!answers.confirm) {
        process.exit();
      }
      logger.print();
    }

    fs.unlinkSync(destinationPath);
    logger.success(`Removed file: ${filename(destinationPath)}`);
  } else {
    logger.error(`${filename(destinationPath)} does not exist`);
    return;
  }

  // If we destroyed a reducer, remove it from the reducers index
  if (command === 'reducer') {
    const reducerIndexPath = path.join(
      CWD,
      'src',
      entrypoint,
      'reducers',
      'index.js',
    );
    try {
      const indexLines = fs
        .readFileSync(reducerIndexPath, { encoding: 'utf8' })
        .split('\n');
      const reducerName: string =
        dirname === '.'
          ? basename
          : convertToCamelCaseWithPrefix(dirname.replace('/', ''), basename);
      const searchPatterns: RegExp[] = [
        new RegExp(`^import\\s+${reducerName}\\s+from.*;`),
        new RegExp(`^  ${reducerName},`),
      ];
      const newIndexLines = indexLines.filter((line: string): boolean => {
        return (
          searchPatterns.filter((pattern: RegExp): boolean =>
            pattern.test(line),
          ).length === 0
        );
      });
      fs.writeFileSync(reducerIndexPath, newIndexLines.join('\n'));
      logger.success(
        `${highlight(reducerName)} removed from reducer index ${filename(
          reducerIndexPath,
        )}`,
      );
    } catch (e) {
      logger.error(
        'Unable to modify reducers index. Reducer not removed from index',
      );
    }
  }

  // Remove the test file
  const testFolder: string = path.resolve(
    path.join(CWD, 'src', entrypoint, availableCommands[command]),
    dirname,
    '__tests__',
  );
  const testPath: string = path.join(
    testFolder,
    `${generatedFileName}.test.js`,
  );
  let testFileExists: boolean = true;
  try {
    fs.statSync(testPath);
  } catch (e) {
    testFileExists = false;
  }

  if (testFileExists) {
    fs.unlinkSync(testPath);
    logger.success(`Removed file: ${filename(testPath)}`);
  } else {
    logger.error(`${filename(testPath)} does not exist`);
  }
};
