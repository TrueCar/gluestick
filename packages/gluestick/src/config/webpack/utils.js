/* @flow */
import type { BabelOptions } from '../../types';

const updateBabelLoaderConfig = (
  config: Object,
  modifier: (config: BabelOptions) => BabelOptions,
): void => {
  let jsRuleIndex: number = -1;
  const jsRule = config.module.rules.find(({ test }, i) => {
    if (test.source.includes('js')) {
      jsRuleIndex = i;
      return true;
    }
    return false;
  });

  let babelLoaderIndex = -1;
  const babelLoader = jsRule.use.find(({ loader }, i) => {
    if (loader === 'babel-loader') {
      babelLoaderIndex = i;
      return true;
    }
    return false;
  });
  // eslint-disable-next-line no-param-reassign
  config.module.rules[jsRuleIndex].use[babelLoaderIndex].options = modifier(
    babelLoader.options,
  );
};

module.exports = {
  updateBabelLoaderConfig,
};
