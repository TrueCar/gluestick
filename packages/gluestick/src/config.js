import type { GSConfig } from './types';

const config: GSConfig = JSON.parse(process.argv[2] || '{}');
module.exports = config;
