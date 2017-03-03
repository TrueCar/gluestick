const createTemplate = module.parent.createTemplate;

const generatorTemplate = createTemplate`
/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

/**
 * To define file template use createTemplate tag function.
 * You can define multiple templates and for example conditionally apply them to entry:
 * template: flag ? template0 : template1
 * You can also use interpolation \${} and put any valid JS expression.
 * To render value based on arguments use arrow function:
 * \${args => args.value}
 */
const template = createTemplate\`
  const var0 = \${Math.pow(2, 2)};
  const var1 = '\${args => args.var1}';
\`;


/**
 * Generator must export object with configuration or function that returns
 * object with configuration.
 * If export is a function, it will receive the following object as first argument:
 * {
 *   name: string; // name of entity specified on generate command execution
 *   dir: string; // additional directory specified on generate command execution
 *   generator: string; // generator name eg: component, reducer, container
 * }
 * Note: \`dir\` field will be appended to every entries' \`path\`.
 * \`dir\` will not be appended to \`file\` field in \`modify\` object, you will
 * need to do it yourself.
 */
module.exports = exports = options => ({
  /**
   * Define shared arguments.
   * Those arguments that are passed down to every entry.
   * Those arguments can be overwritten by entry-specific arguments.
   * Type: Object
   */
  args: {
    var: JSON.stringify(options)
  },
  /**
   * Define modifier to alter existing files or create new one.
   * It can be single modificator or array of modificators:
   * modify: [{
   *   ...
   * }, {
   *   ...
   * }]
   * Type: Object | Array<Object>
   */
  modify: {
    /**
     * File to modify or create (relative to GlueStick project isnside of which command is
     * executed). If extension is ommited, \`.js\` will be assumed.
     * Type: string
     */
    file: "example/fileToModify",
    /**
     * Modifier function that takes content of existing file and absolute path to file
     * and optionally returns string with modified content to overwrite file.
     * If function returns nothing, file will not be overwriten nor created.
     * Type: (content: String, file: String) => void | String
     */
    modifier: (content, file) => {
      console.log(file);
      if (content) {
        console.log(content);
      }
      return "// some comment\\n";
    }
  },
  /**
   * Define single entry.
   * Type: Object
   *
   * Every entry can define it's own arguments that can extend and/or overwrite shared arguments:
   * args: { ... }
   * Type: Object
   *
   * To define multiple entries pass array of entries to \`entires\` property:
   * entries: [{
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * }, {
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * }]
   * Type: Array<Object>
   */
  entry: {
    /**
     * Path to destination directory (relative to GlueStick project isnside of which command is
     * executed) where template will be written to file.
     * Type: string
     */
    path: "example",
    /**
     * Name of file where conent of template will be written to.
     * If extension is ommited, \`.js\` extension is assumed.
     * Type: string
     */
    filename: \`\${options.name}.example\`,
    /**
     * Template returned by createTemplate function.
     */
    template
  }
});
`;

module.exports = (options) => ({
  entry: {
    path: 'generators',
    filename: options.name,
    template: generatorTemplate,
  },
});
