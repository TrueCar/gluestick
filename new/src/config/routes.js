import React from "react";
import { Route, IndexRoute } from "react-router";

import MasterLayout from "../components/MasterLayout";
import HomeApp from "../containers/HomeApp";
import NoMatchApp from "../containers/NoMatchApp";

export default (
  <Route name="app" component={MasterLayout} path="/">
    <IndexRoute name="home" component={HomeApp} />
    <Route path="*" component={NoMatchApp}/>
  </Route>
);

