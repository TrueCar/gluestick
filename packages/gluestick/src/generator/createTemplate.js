/* @flow */

const tag = (spacesToRemove, strings, ...interpolations) => {
  /**
   * Creates template populated with given arguments.
   *
   * @param {any} args Arguments to pass to template
   * @returns {String}
   */

  return (args: Object) => {
    const interpolate = (interpolation) => {
      if (typeof interpolation === 'function') {
        if (!args) {
          throw new Error('No arguments for for template were passed');
        }
        return interpolation(args);
      } else if (interpolation.toString) {
        return interpolation.toString();
      }
      return '';
    };
    const entries = interpolations.reduce((previous, current, index) => {
      const interpolatedCurrentValue = interpolate(current);
      return previous.concat(
      index < strings.length - 1
        ? [interpolatedCurrentValue, strings[index + 1]]
        : [interpolatedCurrentValue],
      );
    }, [strings[0]]);

    const finalString = entries.join('').split('\n').map((line) => {
      if (new RegExp(`[^\\S\\n]{${spacesToRemove}}`, 'i').test(line)) {
        return line.substring(spacesToRemove);
      }
      return line;
    }).join('\n');

    return finalString[0] === '\n' ? finalString.substring(1) : finalString;
  };
};


/**
 * Creates factory function that returs string from given template.
 *
 * @param {Array<String>} strings Strings from template
 * @param {Array<any>} interpolations Interpolations from template
 * @returns {Function}
 */
module.exports = exports = (...params: Array<any>) => {
  if (typeof params[0] === 'number') {
    return (strings: string[], ...interpolations: Array<any>) =>
      tag(params[0], strings, ...interpolations);
  } else if (Array.isArray(params[0])) {
    return tag(0, ...params);
  }
  throw new Error('Invalid type, supporting only numbers');
};
