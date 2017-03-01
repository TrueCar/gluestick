import React from "react";
import { Route } from "react-router";

import TransitionHooks from "../components/TransitionHooks";

export default (routes) => {
  return (
    <Route name="TransitionHooks" component={TransitionHooks}>
      {routes}
    </Route>
  );
};

