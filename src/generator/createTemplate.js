/**
 * Creates factory function that returs string from given template.
 *
 * @param {Array<String>} strings Strings from template
 * @param {Array<any>} interpolations Interpolations from template
 * @returns {Function}
 */
module.exports = exports = (strings, ...interpolations) => {
  /**
   * Creates template populated with given arguments.
   *
   * @param {any} args Arguments to pass to template
   * @returns {String}
   */
  return args => {
    const interpolate = interpolation => {
      if (typeof interpolation === "function") {
        if (!args) {
          throw new Error("No arguments for for template were passed");
        }
        return interpolation(args);
      } else if (interpolation.toString) {
        return interpolation.toString();
      }
      return "";
    };
    let entries = interpolations.reduce((previous, current, index) => {
      const interpolatedCurrentValue = interpolate(current);
      return previous.concat(
        index < strings.length - 1
          ? [interpolatedCurrentValue, strings[index + 1]]
          : [interpolatedCurrentValue]
      );
    }, [strings[0]]);

    entries = entries.join("");
    return entries[0] === "\n" ? entries.substring(1) : entries;
  };
};
