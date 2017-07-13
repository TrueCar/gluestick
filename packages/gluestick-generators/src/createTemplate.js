/* @flow */
type Interpolation = any;
type TemplateCreator = (args: Object) => string;
type TemplateCreatorFactory = (
  strings: string[],
  interpolations: Interpolation[],
) => TemplateCreator;

const tag = (
  spacesToRemove: number,
  strings: string[],
  ...interpolations: Interpolation[]
): TemplateCreator => {
  /**
   * Creates template populated with given arguments.
   *
   * @param {object} args Arguments to pass to template
   * @returns {string} finalString
   */

  return (args: Object): string => {
    const interpolate = (interpolation: Interpolation): string => {
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
    const entries: string[] = interpolations.reduce(
      (previous: string[], current: any, index: number) => {
        const interpolatedCurrentValue: string = interpolate(current);
        return previous.concat(
          index < strings.length - 1
            ? [interpolatedCurrentValue, strings[index + 1]]
            : [interpolatedCurrentValue],
        );
      },
      [strings[0]],
    );

    const finalString: string = entries
      .join('')
      .split('\n')
      .map((line: string): string => {
        if (new RegExp(`[^\\S\\n]{${spacesToRemove}}`, 'i').test(line)) {
          return line.substring(spacesToRemove);
        }
        return line;
      })
      .join('\n');

    return finalString[0] === '\n' ? finalString.substring(1) : finalString;
  };
};

/**
 * Creates factory function that returns string from given template.
 *
 * @param {Array<string>} strings Strings from template
 * @param {Array<any>} interpolations Interpolations from template
 * @returns {Function} TemplateCreator returns string
 */

module.exports = (
  ...params: Array<any>
): TemplateCreator | TemplateCreatorFactory => {
  if (typeof params[0] === 'number') {
    return (
      strings: string[],
      ...interpolations: Array<any>
    ): TemplateCreator => tag(params[0], strings, ...interpolations);
  } else if (Array.isArray(params[0])) {
    return tag(0, ...params);
  }
  throw new Error('Invalid type, supporting only numbers');
};
