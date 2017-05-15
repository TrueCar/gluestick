/* @flow */

import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

type ApplicationServer = {
  protocol: string;
  host: string;
  port: number;
  assetPort: number;
}

const applicationServer: ApplicationServer = {
  protocol: "http",
  host: "0.0.0.0",
  port: 8888,
  assetPort: 8880
};

export default applicationServer;
`;
