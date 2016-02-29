import React, { Component, PropTypes } from "react";
import Radium, { StyleRoot } from "radium";
import { createTransitionHook } from "../lib/route-helper";

@Radium
export default class TransitionHooks extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    const { routes } = this.props;
    const { store, router } = this.context;
    this.unListenBefore = router.listenBefore(createTransitionHook(store, routes));
  }

  componentWillUnmount() {
    this.unListenBefore();
  }

  render () {
    return (
      <StyleRoot>
        {this.props.children}
      </StyleRoot>
    );
  }
}

