import React, { Component, PropTypes } from "react";
import { createTransitionHook } from "../lib/route-helper";

export default class TransitionHooks extends Component {
  static contextTypes = {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentWillMount() {
    const { history } = this.props;
    const { store } = this.context;
    this.unListenBefore = history.listenBefore(createTransitionHook(store, history));
  }

  componentWillUnmount() {
    this.unListenBefore();
  }

  render () {
    return (
      <div>{this.props.children}</div>
    );
  }
}

