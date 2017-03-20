/* @flow */

import React from 'react';
import { Route } from 'react-router';

import TransitionHooks from '../components/TransitionHooks';

export default (routes: Object) => {
  return (
    <Route name="TransitionHooks" component={TransitionHooks}>
      {routes}
    </Route>
  );
};
