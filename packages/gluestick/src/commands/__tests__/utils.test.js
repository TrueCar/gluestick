/* @flow */
const utils = require('../utils');

test('commands/utils#filterArgs should exclude given arg from array', () => {
  expect(utils.filterArg(['--arg1', '--arg2'], 'arg1')).toEqual(['--arg2']);
});
