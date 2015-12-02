import React from "react";
import { Route, IndexRoute } from "react-router";

import MasterLayout from "../components/MasterLayout";
import HomeApp from "../containers/HomeApp";

export default (
    <Route name="app" component={MasterLayout} path="/">
        <IndexRoute name="home" component={HomeApp} />
        <Route name="home" path="/test" component={HomeApp} />
    </Route>
);

