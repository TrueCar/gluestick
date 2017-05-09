jest.mock('gluestick-generators');

const generator = require('gluestick-generators').default;
const generate = require('../generate');
const commandApi = require('../../__tests__/mocks/context').commandApi;

describe('commands/generate', () => {
  // Needed for test not to finish when calling generate
  // $FlowFixMe Flow doesn't like that we assign process.exit to a mock function
  process.exit = jest.fn();

  it('calls the generator with correct parameters', () => {
    generate(commandApi, ['component', 'MyComponent', {}]);
    expect(generator.mock.calls[0][0]).toEqual({
      entityName: 'MyComponent',
      generatorName: 'component',
      options: {},
    });
  });
});
