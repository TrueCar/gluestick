const logger = { warn: jest.fn() };
const { getRenderMethod } = require('../utils')(logger);

test('src/plugins/utils getRenderMethod should return last render method from plugins', () => {
  const lastRenderMethod = jest.fn(() => 'output');
  const results = getRenderMethod(
    [
      {
        renderMethod: jest.fn(),
      },
      {
        renderMethod: lastRenderMethod,
      },
      {
        renderMethod: 'test',
      },
    ],
    logger,
  );
  expect(results).toEqual(lastRenderMethod);
  expect(logger.warn.mock.calls[0]).toEqual([
    'You have more than one render method!',
  ]);
});

test('src/plugins/utils getRenderMethod should return null if no renderMethod was found', () => {
  const results = getRenderMethod(
    [
      {
        renderMethod: 'test',
      },
    ],
    logger,
  );
  expect(results).toBeNull();
});
