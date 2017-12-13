/* @flow */

import type { Logger } from '../types';

export type WebpackConfig = {
  merge(
    configPartialOrFunction: Object | (WebpackConfig => void),
  ): WebpackConfig,
  toObject(): Object,
};

export type Entries = { [key: string]: string | string[] };

export type ClientConfigOptions = {
  entries: Entries,
  noProgress: boolean,
};

export type ServerConfigOptions = {
  entries: string,
  noProgress: boolean,
};

export type ConfigUtils = {
  logger: Logger,
};

export type WebpackOptions = {
  skipClientEntryGeneration: boolean,
  skipServerEntryGeneration: boolean,
  entries: Entries,
  noProgress: boolean,
};
