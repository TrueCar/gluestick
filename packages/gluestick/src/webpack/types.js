/* @flow */

import type { Logger } from '../types';

export type WebpackConfig = {
  merge(
    configPartialOrFunction: Object | (WebpackConfig => void),
  ): WebpackConfig,
};

type Entries = string | { [key: string]: string | string[] };

export type ClientConfigOptions = {
  entries: Entries,
  noProgress: boolean,
};

export type SeverConfigOptions = ClientConfigOptions;

export type ConfigUtils = {
  logger: Logger,
};

export type WebpackOptions = {
  skipClientEntryGeneration: boolean,
  skipServerEntryGeneration: boolean,
  entries: Entries,
  noProgress: boolean,
};
