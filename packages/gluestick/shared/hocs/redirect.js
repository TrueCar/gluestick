/* @flow */

import React from 'react';
import { Redirect } from 'react-router';

export default function redirect(config: *) {
  return () => <Redirect {...config} />;
}
