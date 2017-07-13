jest.mock('gluestick-generators', () => ({ default: jest.fn() }));
jest.mock(
  'entries.json',
  () => ({
    '/': {
      component: 'path/to/main/component',
      routes: 'path/to/main/routes',
      reducers: 'path/to/main/reducers',
    },
    '/home': {
      component: 'path/to/home/component',
      routes: 'path/to/home/routes',
      reducers: 'path/to/home/reducers',
      config: 'path/to/home/config',
    },
  }),
  { virtual: true },
);
jest.mock('plugins-config.js', () => [], { virtual: true });
