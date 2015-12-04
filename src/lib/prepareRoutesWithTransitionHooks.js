import React from "react";
import { Route } from "react-router";

import TransitionHooks from "../shared/components/TransitionHooks";

export default (routes) => {
    return (
        <Route name="TransitionHooks" component={TransitionHooks}>
            {routes}
        </Route>
    );
};

