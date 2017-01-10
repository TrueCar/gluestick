const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const logger = require("./cliLogger");
const fs = require("fs");

/**
 * Read the contents of a file, convert it to an abstract syntax tree and
 * figure out how many process.env.X properties are accessed. Return an array
 * of environment variables.
 *
 * @param {String} pathToFile absolute path to the file to analyze
 */
module.exports = function detectEnvironmentVariables (pathToFile) {
  const code = fs.readFileSync(pathToFile, {encoding: "utf8"});
  const ast = babylon.parse(code, {
    sourceType: "module",
    plugins: [
      "objectRestSpread"
    ]
  });
  const environmentVariables = new Set();
  traverse(ast.program, {
    enter: function (path) {
      if (path.type === "MemberExpression") {
        const node = path.node;
        try {
          const target = node.object;
          if (!!target.object && target.object.name === "process" && target.property.name === "env") {
            environmentVariables.add(node.property.name);
          }
        }
        catch (e) {
          logger.warn("Error detecting environment variables:", e);
        }
      }
    }
  });

  return Array.from(environmentVariables);
};

