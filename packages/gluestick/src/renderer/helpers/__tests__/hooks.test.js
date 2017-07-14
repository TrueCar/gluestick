const hooks = require('../hooks');

test('renderer/helpers/hooks should call hooks', () => {
  const fn = jest.fn(() => 'return');
  expect(hooks.call(null, 'arg')).toEqual('arg');
  expect(hooks.call(fn, 'arg')).toEqual('return');
  expect(hooks.call([fn], 'arg-1')).toEqual('return');
  expect(fn.mock.calls[0]).toEqual(['arg']);
  expect(fn.mock.calls[1]).toEqual(['arg-1']);
});

test('renderer/helpers/hooks should merge hooks', () => {
  const fn = jest.fn();
  const projectHooks = {
    hook1: [fn],
    hook2: [fn],
  };
  const plugins = [
    {
      hooks: {
        hook1: fn,
        hook3: fn,
      },
    },
    {
      hooks: {
        hook3: fn,
      },
    },
  ];
  expect(hooks.merge(projectHooks, plugins)).toEqual({
    hook1: [fn, fn],
    hook2: [fn],
    hook3: [fn, fn],
  });
});
