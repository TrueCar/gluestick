/* @flow */

import React from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { getDisplayName } from './utils';

type DataLoaderConfig = {
  onEnter: Function,
  shouldReloadData: Function,
  Pending: *,
};

type DataLoaderProps = any;

type DataLoaderState = {
  loaded: boolean,
};

let isInitialRender = true;

export function markInitialRenderAsDone() {
  isInitialRender = false;
}

export default function withDataLoader(config: DataLoaderConfig) {
  const { Pending, onEnter, shouldReloadData } = config;

  return (Component: *) => {
    let instance;
    async function instanceAwareOnEnter(...args) {
      /**
       * Skip loading the data if shouldReloadData returns false,
       * and the data was previously loaded.
       */
      if (
        !isInitialRender &&
        typeof shouldReloadData === 'function' &&
        !shouldReloadData() &&
        DataLoader.hasLoadedDataOnClientBefore
      ) {
        return;
      }

      await onEnter(...args);

      DataLoader.hasLoadedDataOnClientBefore = true;
      if (instance) {
        instance.setState({ loaded: true });
      }
    }

    class DataLoader extends React.Component<
      void,
      DataLoaderProps,
      DataLoaderState,
    > {
      static onEnter = instanceAwareOnEnter;
      static hasLoadedDataOnClientBefore = false;

      state: DataLoaderState;

      constructor(props: DataLoaderProps) {
        super(props);

        this.state = {
          loaded:
            typeof window === 'undefined' ||
            isInitialRender ||
            (typeof shouldReloadData === 'function'
              ? !shouldReloadData() && DataLoader.hasLoadedDataOnClientBefore
              : false),
        };
      }

      componentDidMount() {
        instance = this;
        DataLoader.hasLoadedDataOnClientBefore =
          DataLoader.hasLoadedDataOnClientBefore || isInitialRender;
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
