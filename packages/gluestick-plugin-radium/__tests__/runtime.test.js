const gluestickPluginRadium = require('../runtime').default.plugin;

test('Radium plugin should wrap component with StyleRoot', () => {
  const results = gluestickPluginRadium('component', { userAgent: 'test' });
  expect(results.type.displayName).toEqual('StyleRoot');
  expect(results.props.radiumConfig).toEqual({ userAgent: 'test' });
  expect(results.props.children).toEqual('component');
});
