// @flow
import type { Config } from './types';

const config: Config = JSON.parse(process.argv[2] || '{}');
export default config;
