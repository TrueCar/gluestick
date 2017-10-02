/* @flow */

import * as React from 'react';
import { getDisplayName } from './utils';

function isInitialRender({ history }: any, DataLoader) {
  const output =
    (history.action === 'POP' && !DataLoader.isRendered) ||
    typeof window === 'undefined';

  // eslint-disable-next-line no-param-reassign
  DataLoader.isRendered = true;

  return output;
}

type DataLoaderConfig = {
  Loading: React.ComponentType<any>,
  onEnter: Function,
  shouldReloadData: Function,
};

type DataLoaderProps = {
  match: any,
};

type DataLoaderState = {
  loaded: boolean,
};

export default function withDataLoader(config: DataLoaderConfig) {
  const { Loading, onEnter, shouldReloadData } = config;

  return (Component: React.ComponentType<any>) => {
    class DataLoader extends React.Component<DataLoaderProps, DataLoaderState> {
      static onEnter = onEnter;
      static isRendered = false;

      constructor(props: DataLoaderProps) {
        super(props);

        this.state = {
          loaded:
            isInitialRender(this.props, DataLoader) ||
            (shouldReloadData ? !shouldReloadData() : false),
        };
      }

      // $FlowFixMe
      async componentDidMount() {
        if (!this.state.loaded) {
          await DataLoader.onEnter(this.props.match, null);

          // eslint-disable-next-line react/no-did-mount-set-state
          this.setState({
            loaded: true,
          });
        }
      }

      render() {
        return this.state.loaded ? <Component /> : <Loading />;
      }
    }

    DataLoader.displayName = `${getDisplayName(Component)}DataLoader`;

    return DataLoader;
  };
}
