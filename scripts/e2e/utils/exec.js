const execSync = require('child_process').execSync;

module.exports = (command, cwd = process.cwd(), customEnv = {}) => {
  console.log();
  console.log(`/${'*'.repeat(80)}/`);
  console.log(' * Running command');
  console.log(` *   ${command}`);
  if (Object.keys(customEnv).length) {
    console.log(' * with custom env:');
    console.log(` *   ${JSON.stringify(customEnv)}`);
  }
  console.log(' * in directory:');
  console.log(` *   ${cwd}`);
  console.log(`/${'*'.repeat(80)}/`);

  if (process.env.CI) {
    let stdout;
    try {
      stdout = execSync(command, {
        cwd,
        stdio: 'pipe',
        env: Object.assign({}, process.env, customEnv),
      });
    } catch (e) {
      throw new Error(e.stderr.toString());
    }
    return stdout;
  }

  return execSync(command, {
    cwd,
    stdio: 'inherit',
    env: Object.assign({}, process.env, customEnv),
  });
};
