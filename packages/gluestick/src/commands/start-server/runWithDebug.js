// const path = require('path');
// const { spawn } = require('cross-spawn');
// const chokidar = require('chokidar');

// const watchSource = callback => {
//   let timeout;
//   chokidar.watch([
//     path.join(process.cwd(), 'src/**/*.js'),
//     path.join(process.cwd(), 'test/**/*.js'),
//   ], {
//     ignored: /[/\\]\./,
//     persistent: true,
//   }).on('all', () => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       callback();
//     }, 250);
//   });
// };


// const runWithDebug = ({ config, logger }, serverEntrypointPath, debugPort) => {
//   const debugSpawn = spawn(
//     'node',
//     [
//       '--',
//       `--inspect${debugPort ? `=${debugPort}` : ''}`,
//       serverEntrypointPath,
//     ],
//     {
//       stdio: 'inherit',
//       env: Object.assign({}, process.env, { NODE_ENV: 'development-server' }),
//     },
//   );
//   debugSpawn.on('error', error => {
//     logger.error(error);
//   });
//   return debugSpawn;
// };

module.exports = () => {
  // let debugSpawn;
  // watchSource(() => {
  //   debugSpawn.kill();

  //   // killing a child process isn't immediate… we need to wait for it to
  //   // have a chance to complete before restarting
  //   setTimeout(() => {
  //     debugSpawn = runWithDebug({ config, logger }, serverEntrypointPath, debugPort);
  //   }, 500); // check if this can be replaced with process.nextTick
  // });
  // debugSpawn = runWithDebug({ config, logger }, serverEntrypointPath, debugPort);
};
