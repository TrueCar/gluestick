const inquirer = require('inquirer');
const { highlight, filename } = require('../cli/colorScheme');
const generate = require('../generator');
const path = require('path');

const generateTemplate = (generatorName, entityName, logger) => {
  generate({
    generatorName,
    entityName,
  }, logger);
};

module.exports = ({ logger }) => {
  const currentlyInProjectFolder = (folderPath) => {
    const fileName = path.join(folderPath, 'package.json');
    let data = null;
    try {
      data = require(fileName);
      return !!data.dependencies && !!data.dependencies.gluestick;
    } catch (e) {
      return false;
    }
  };

  console.log(`${filename(process.cwd())}`);
    // Run from inside an existing project, install in current directory if approved
  if (currentlyInProjectFolder(process.cwd())) {
    logger.info(
      `You are about to initialize a new gluestick project at ${filename(process.cwd())}`,
    );
    const question = {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you wish to continue?',
    };
    inquirer.prompt([question]).then((answers) => {
      if (!answers.confirm) { return; }
      generateTemplate('new', 'new', logger);
    });
    return;
  }

  generateTemplate('new', 'new', logger);
};

function _printInstructions(/* projectName */) {
  logger.info(`${highlight('New GlueStick project created')} at ${filename(process.cwd())}`);
  logger.info('To run your app and start developing');
  logger.info(`cd ${projectName}`);
  logger.info('gluestick start');
  logger.info('Point the browser to http://localhost:8888');
}
