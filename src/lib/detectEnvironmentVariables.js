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
        const node = path.node;
        try {
          if (node.object.object.name === "process" && node.object.property.name === "env") {
            environmentVariables.push(node.property.name);
          }
        }
        catch (e) {}
      }
    }
  });

  return environmentVariables;
};

