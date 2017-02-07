const path = require('path');
const express = require('express');
const compression = require('compression');

module.exports = ({ config, logger }) => {
  const app = express();

  app.use(compression());
  app.use(express.static(
    path.join(process.cwd(), config.assetsPath),
  ));

  if (process.env.NODE_ENV !== 'production') {
    app.get('/gluestick-proxy-poll', (req, res) => {
      // allow requests from our client side loading page
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.status(200).json({ up: true });
    });
  }

  // TODO: replace with actuall SSR middleware.
  app.use((req, res) => {
    res.status(501).send('There should be a SSR middleware.');
  });

  const server = app.listen(config.port);
  logger.success(`Renderer listening on port ${config.port}.`);
  process.on('exit', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
};
