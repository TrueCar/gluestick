var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
var sha1 = require("sha1");

/**
 * Let the user know that we are updating the file and copy the contents over.
 *
 * @param {String} name the name of the file
 * @param {String} data the data for the new file
 */
function replaceFile (name, data) {
    const filePath = getCurrentFilePath(name);
    console.log(chalk.yellow(`${name} file out of date.`));
    console.log(chalk.green(`Updating ${filePath}`));

    fs.writeFileSync(filePath, data);
}

/**
 * Get the path to the file in the current project's config folder.
 *
 * @param {String} name the file name we are looking for
 */
function getCurrentFilePath (name) {
    return path.join(process.cwd(), "src", "config", name);
}

module.exports = function () {
    // Make sure we are in a gluestick project
    try {
        fs.statSync(path.join(process.cwd(), ".gluestick"))
    }
    catch (e) {
        console.log(chalk.red("This does not appear to be a valid GlueStick project. Please run this command inside of a gluestick project"));
        process.exit();
    }

    // Compare contents of our hidden files, if they do not match up then auto
    // update
    [".entry.js", ".store.js"].forEach((fileName) => {
        const currentFile = fs.readFileSync(getCurrentFilePath(fileName));
        const currentSha = sha1(currentFile);

        const newFile = fs.readFileSync(path.join(__dirname, "..", "new", "src", "config", fileName), "utf8");
        const newSha = sha1(newFile);

        if (currentSha !== newSha) {
            replaceFile(fileName, newFile);
        }
    });

    // @TODO we should load the package.json file and match up the gluestick module version to the CLI version
};

