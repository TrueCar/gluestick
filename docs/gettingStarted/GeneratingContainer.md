# Generating a Container

GlueStick includes several generators to help boost productivity even further. Given its role in the application development, you will start with the Container generator. GlueStick apps use Redux for managing application-state. When using Redux, components that are directly connected to Redux are referred to as “containers.” These will generally be components that we connect to a route in our router. Now that the essentials are in place, we’re going to walk you through the creation of an actual application. For this guide, you will build a todo list application. (After all, we ARE trying to boost productivity.) Your first step will be generating a container for your todo list. gluestick `generate container Todos`

This will generate the following file: `src/containers/Todos.js`


```js
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

@connect(
  (state) => ({/** _INSERT_STATE_  **/}),
  (dispatch) => bindActionCreators({/** _INSERT_ACTION_CREATORS_ **/}, dispatch)
)
export default class Todos extends Component {
  static fetchData ({dispatch}) {}

  render () {
    return (
      <div>Todos</div>
    );
  }
}
```


As you can see, this is a simple component that is already hooked up to the Redux store for you. Notice the static method, fetchData, gives you a hook whereby you can asynchronously fetch data before your container is rendered. Your server-side request won’t respond until all of the data is filled in so that you don’t end up returning to your app’s loading state for every thing. To match this container to a route, we will need to add an entry to the routes file. If you have used React Router, then the routes file will look familiar to you, since we built this in to GlueStick already. However, we have already hooked up the router for you so that you don’t have to mess with it and can just focus on defining your routes.


The routes file is located at `src/config/routes.js` and it looks like this:


```js
import React from "react";
import { Route, IndexRoute } from "react-router";

import MasterLayout from "../components/MasterLayout";
import HomeApp from "../containers/HomeApp";

export default (
  <Route name="app" component={MasterLayout} path="/">
    <IndexRoute name="home" component={HomeApp} />
  </Route>
);
```

Matching your newly created Todos container with a route is simple. First, import your container, then add a nested route with the correct path and component.



```js
import React from "react";
import { Route, IndexRoute } from "react-router";

import MasterLayout from "../components/MasterLayout";
import HomeApp from "../containers/HomeApp";
import Todos from "../containers/Todos";

export default (
  <Route name="app" component={MasterLayout} path="/">
    <IndexRoute name="home" component={HomeApp} />
    <Route name="todos" component={Todos} path="/todos" />
  </Route>
);
```

Now direct your browser to http://localhost:8888/todos and your new container should show up.
