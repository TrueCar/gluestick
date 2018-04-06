// @flow
describe('hooks', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('merging', () => {
    it('merges plugin hooks with project hooks', () => {
      jest.mock('gluestick-hooks', () => ({
        default: {
          hook1: ['hook1'],
          hook2: 'hook2',
        },
      }));
      jest.mock('../../../plugins/serverPlugins', () => [
        {
          hooks: {
            hook1: ['hook3'],
            hook3: 'hook4',
          },
        },
        {
          hooks: {
            hook3: ['hook5'],
          },
        },
      ]);
      const hooks = require('../hooks').default;
      expect(hooks).toEqual({
        hook1: ['hook3', 'hook1'],
        hook2: ['hook2'],
        hook3: ['hook4', 'hook5'],
      });
    });

    it('skips plugins with no hooks or empty hooks', () => {
      jest.mock('gluestick-hooks', () => ({
        default: {
          hook1: ['hook1'],
          hook2: ['hook2'],
        },
      }));
      jest.mock('../../../plugins/serverPlugins', () => [
        {
          hooks: {},
        },
        {},
      ]);
      const hooks = require('../hooks').default;
      expect(hooks).toEqual({
        hook1: ['hook1'],
        hook2: ['hook2'],
      });
    });
  });
});
