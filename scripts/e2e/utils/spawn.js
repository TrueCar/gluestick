const { spawn } = require('child_process');

module.exports = (command, args, customEnv = {}, customCwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    console.log();
    console.log(`/${'*'.repeat(80)}/`);
    console.log(` * Running ${command} command:`);
    console.log(` *   ${args.join(' ')}`);
    if (Object.keys(customEnv).length) {
      console.log(' * with custom env:');
      console.log(` *   ${JSON.stringify(customEnv)}`);
    }
    console.log(' * in directory:');
    console.log(` *   ${customCwd}`);
    console.log(`/${'*'.repeat(80)}/`);

    const childProcess = spawn(command, [...args], {
      stdio: 'inherit',
      cwd: customCwd,
      env: Object.assign({}, process.env, customEnv),
    });

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${args.join(' ')} errored with code: ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(`${args.join(' ')} errored: ${error.toString()}`);
    });
  });
};

