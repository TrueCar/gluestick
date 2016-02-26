var fs = require("fs");
var babel = require("babel-core");
var traverse = require("babel-traverse").default;

/**
 * Read the contents of a file, convert it to an abstract syntax tree and
 * figure out how many process.env.X properties are accessed. Return an array
 * of environment variables.
 *
 * @param {String} pathToFile absolute path to the file to analyze
 */
module.exports = function detectEnvironmentVariables (pathToFile) {
  var ast = babel.transformFileSync(pathToFile).ast;
  var environmentVariables = [];
  traverse(ast.program, {
    enter: function (path) {
      if (path.type === "MemberExpression") {
        try {
          if (path.node.object.name === "process" && path.node.property.name === "env") {
            environmentVariables.push(path.node.property.name);
          }
        }
        catch (e) {}
      }
    }
  });

  return environmentVariables;
};

