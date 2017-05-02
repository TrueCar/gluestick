/* @flow */

import React from 'react';
import { Route } from 'react-router';

import TransitionHooks from '../components/TransitionHooks';

// eslint-disable-next-line no-undef
export default (routes: Object): React$Element<*> => {
  return (
    <Route name="TransitionHooks" component={TransitionHooks}>
      {routes}
    </Route>
  );
};
