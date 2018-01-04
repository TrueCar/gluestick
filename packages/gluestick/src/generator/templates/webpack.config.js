/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
import Config from "webpack-config";

export const client = base => new Config().merge(base);
export const server = base => new Config().merge(base);
export const vendor = base => new Config().merge(base);
`;
