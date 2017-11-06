/* @flow */

import * as React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { getDisplayName } from './utils';

type DataLoaderConfig = {
  onEnter: Function,
  shouldReloadData: Function,
  Pending: React.ComponentType<any>,
};

type DataLoaderProps = any;

type DataLoaderState = {
  loaded: boolean,
};

let isInitialRender = true;
if (typeof window !== 'undefined') {
  /**
   * Unless navigation occurs we assume the page is rendered by the first time,
   * thus wrapped components will have data already present in store.
   */
  ['pushState', 'replaceState', 'go', 'back', 'forward'].forEach(name => {
    const target = window.history[name];
    window.history[name] = (...args) => {
      isInitialRender = false;
      target.apply(window.history, args);
    };
  });
}

export default function withDataLoader(config: DataLoaderConfig) {
  const { Pending, onEnter, shouldReloadData } = config;

  return (Component: React.ComponentType<any>) => {
    let instance;
    async function instanceAwareOnEnter(...args) {
      if (
        DataLoader.hasLoadedDataBefore &&
        !isInitialRender &&
        typeof shouldReloadData === 'function' &&
        !shouldReloadData()
      ) {
        return;
      }

      await onEnter(...args);

      if (instance) {
        DataLoader.hasLoadedDataBefore = true;
        instance.setState({ loaded: true });
      }
    }

    class DataLoader extends React.Component<DataLoaderProps, DataLoaderState> {
      static onEnter = instanceAwareOnEnter;
      static hasLoadedDataBefore = false;

      constructor(props: DataLoaderProps) {
        super(props);

        this.state = {
          loaded:
            typeof window === 'undefined' ||
            isInitialRender ||
            (DataLoader.hasLoadedDataBefore &&
            typeof shouldReloadData === 'function'
              ? !shouldReloadData()
              : false),
        };
      }

      componentDidMount() {
        instance = this;
      }

      render() {
        return !Pending || this.state.loaded
          ? <Component {...this.props} isPending={!this.state.loaded} />
          : <Pending {...this.props} />;
      }
    }

    DataLoader.displayName = `${getDisplayName(Component)}DataLoader`;

    return hoistNonReactStatic(DataLoader, Component);
  };
}
