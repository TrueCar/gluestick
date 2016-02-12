var fs = require("fs");
var babel = require("babel-core");
var traverse = require("estraverse").traverse;

/**
 * Read the contents of a file, convert it to an abstract syntax tree and
 * figure out how many process.env.X properties are accessed. Return an array
 * of environment variables.
 *
 * @param {String} pathToFile absolute path to the file to analyze
 */
module.exports = function detectEnvironmentVariables (pathToFile) {
  var contents = fs.readFileSync(pathToFile, "utf8");

  if (!contents) return [];

  var ast = babel.transform(contents).ast;
  var environmentVariables = [];
  traverse(ast.program, {
    enter: function (path) {
      if (path.type === "MemberExpression") {
        try {
          if (path.object.object.name === "process" && path.object.property.name === "env") {
            environmentVariables.push(path.property.name);
          }
        }
        catch (e) {}
      }
    }
  });

  return environmentVariables;
};

