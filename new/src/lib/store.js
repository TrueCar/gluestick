import { createStore } from "gluestick";

// The following line creates the store and properly sets up hot module replacement for reducers
export default createStore(() => require("../reducers"), (cb) => module.hot && module.hot.accept("../reducers", cb));

