jest.mock('../../generator');

const generate = require('../generate');
const generator = require('../../generator');
const logger = require('../../cli/logger');

describe('cli: gluestick generate', () => {
  // Needed for test not to finish when calling generate
  // $FlowFixMe Flow doesn't like that we assign process.exit to a mock function
  process.exit = jest.fn();

  it('calls the generator with correct parameters', () => {
    const config = { plugins: [] };
    generate({ config, logger }, 'component', 'MyComponent', {});
    expect(generator).toBeCalledWith(
      {
        entityName: 'MyComponent',
        generatorName: 'component',
        options: {},
      },
      logger,
    );
  });
});
