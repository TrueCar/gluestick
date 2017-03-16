import React, { Component, PropTypes } from 'react';
import { createTransitionHook } from '../lib/route-helper';

export default class TransitionHooks extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    const { routes } = this.props;
    const { store, router } = this.context;
    this.unListenBefore = router.listenBefore(createTransitionHook(store, routes));
  }

  componentWillUnmount() {
    this.unListenBefore();
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

