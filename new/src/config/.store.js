/** DO NOT MODIFY **/
// The following lines create the store and properly sets up hot module replacement for reducers
import { createStore } from "gluestick";
export default function () {
    return createStore(() => require("../reducers"), (cb) => module.hot && module.hot.accept("../reducers", cb), !!module.hot);
}

