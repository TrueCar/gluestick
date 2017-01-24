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
 * For every property that is a function (\`args\`, \`entry\` or entry in \`entries\`)
 * \`options\` argument will be passed:
 * {
 *   name: string; // name of entity specified on generate command execution
 *   generator: string; // generator name eg: component, reducer, container
 * }
 */
module.exports = exports = {
  /**
   * Define shared arguments.
   * Those arguments that are passed down to every entry.
   * It can be an object or function that returns object.
   * Those arguments can be overwritten by entry-specific arguments.
   * Type: Object | (options?: Object) => Arguments
   */
  args: options => ({
    var: JSON.stringify(options)
  }),
  /**
   * Define single entry.
   * It can be an object or function that returns object.
   * Type: Object | (options?: Object) => Entry
   *
   * Every entry can define it's own arguments that can extend and/or overwrite shared arguments:
   * args: option => ({ ... })
   * It can be an object or function that returns object.
   * Type: Object | (options?: Object) => Arguments
   *
   * To define multiple entries pass array of entries to \`entires\` property:
   * entries: [{
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * }, options => ({
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * })]
   * Type: Array<Object | (options?: Object) => Entry>
   */
  entry: options => ({
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
  })
};
`;

module.exports = exports = {
  entry: options => ({
    path: "generators",
    filename: options.name,
    template: generatorTemplate
  })
};
