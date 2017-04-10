const { spawn } = require('child_process');

module.exports = (command, customCwd = process.cwd(), customEnv = {}, stdio = 'inherit') => {
  const bin = command.split(' ')[0];
  const args = command.split(' ').slice(1);
  return new Promise((resolve, reject) => {
    console.log();
    console.log(`/${'*'.repeat(80)}/`);
    console.log(` * Running ${bin} command:`);
    console.log(` *   ${args.join(' ')}`);
    if (Object.keys(customEnv).length) {
      console.log(' * with custom env:');
      console.log(` *   ${JSON.stringify(customEnv)}`);
    }
    console.log(' * in directory:');
    console.log(` *   ${customCwd}`);
    console.log(`/${'*'.repeat(80)}/`);

    const childProcess = spawn(bin, [...args], {
      stdio,
      cwd: customCwd,
      env: Object.assign({}, process.env, customEnv),
    });

    let stdout = '';
    let stderr = '';
    if (stdio === 'pipe') {
      childProcess.stdout.on('data', data => {
        stdout += data.toString();
      });
      childProcess.stderr.on('data', data => {
        stderr += data.toString();
      });
    }

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${args.join(' ')} errored with code: ${code}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(`${args.join(' ')} errored: ${error.toString()}`);
    });
  });
};

