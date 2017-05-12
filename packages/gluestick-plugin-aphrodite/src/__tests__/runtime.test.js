jest.mock('aphrodite', () => ({
  StyleSheet: { rehydrate: jest.fn() },
}));
global.renderedClassNames = 'renderedClassNames';
const runtime = require('../runtime').default;
const StyleSheet = require('aphrodite').StyleSheet;

test('Aphrodite runtime plugin should rehydrate', () => {
  expect(runtime.meta.hook).toBeTruthy();
  runtime.plugin();
  expect(StyleSheet.rehydrate.mock.calls[0]).toEqual(['renderedClassNames']);
});
