/* @flow */

import React from 'react';
import { getDisplayName } from './utils';

type ScrollBehaviorConfig = {
  ignore?: boolean | ((prev: Location, next: Location) => boolean),
  behavior?: (prev: Location, next: Location) => [number, number],
};

const defaults = {
  ignore(prev: Location, next: Location): boolean {
    return prev.pathname !== next.pathname;
  },
  // eslint-disable-next-line no-unused-vars
  behavior(prev: Location, next: Location): [number, number] {
    return [0, 0];
  },
};

export default function withScrollBehavior(config: ScrollBehaviorConfig = {}) {
  const { ignore, behavior } = { ...defaults, ...config };
  return (Component: React.ComponentType<any>) => {
    class ScrollBehavior extends React.Component {
      componentDidMount() {
        setTimeout(() => {
          const { prev, next } = this.props.getLocationDiff();
          if (typeof ignore === 'function' ? ignore(prev, next) : ignore) {
            window.scrollTo(behavior(prev, next));
          }
        });
      }

      render() {
        const { getLocationDiff, ...rest } = this.props;
        return <Component {...rest} />;
      }
    }

    ScrollBehavior.displayName = `${getDisplayName(
      Component,
    )}WithScrollBehavior`;

    return ScrollBehavior;
  };
}
