jest.mock('child_process', () => {
  let count = 0;
  return {
    execSync: jest.fn(arg => {
      if (arg === 'npm -v') {
        const version = count === 0 ? '4.0.0' : '5.0.0';
        count++;
        return version;
      }
      return null;
    }),
  };
});

const reset = require('../reset');
const { execSync } = require('child_process');

it('calls npm cache clean with ---force for npm@5', () => {
  // < 5.x.x
  reset();
  expect(execSync).toBeCalledWith(`npm cache clean`, { stdio: 'inherit' });
  // >= 5.x.x
  execSync.mockClear();
  reset();
  expect(execSync).toBeCalledWith(`npm cache clean --force`, {
    stdio: 'inherit',
  });
});
