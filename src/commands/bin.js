import { exec } from "shelljs";
import path from "path";

const invokeDependency = (name) =>
  path.join(__dirname, "..", "..", "node_modules", ".bin", name);

const prepareExecCommand = (path, args, options) => {
  const flattenArgs = args.reduce((prev, next) => `${prev} ${next}`, "");
  const flattenOptions = options.reduce((prev, next) => `${prev} ${next}`, "");

  return `${path} ${flattenArgs} ${flattenOptions}`;
};

const parseOptions = (options) => {
  const isShorthand = (option) => option.length === 1;

  return options.map((option) => isShorthand(option) ? `-${option}` : `--${option}`);
};

module.exports = function(dependencyName, dependencyCommands, { options }) {
  const optionsArray = typeof options === "string" ? options.split(",") : [];
  const execCommand = prepareExecCommand(
    invokeDependency(dependencyName),
    dependencyCommands,
    parseOptions(optionsArray)
  );

  exec(execCommand);
};
