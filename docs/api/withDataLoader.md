# `withDataLoader`

### Description

Add data fetching logic to your component, which will be fetched in synchronous manner on server to
load the data before sending the rendered page and asynchronously on client not to block navigation
and make your app feel more responsive.

### Usage

```js
import React from 'react';
import { connect } from 'react-redux';
import { withDataLoader } from 'compiled/gluestick';

class MyComponent extends React.Component {
  render() {
    return (
      <span>
        {this.props.isPending ? 'Loading...' : this.props.myData}
      </span>
    );
  }
}

export default connect(
  state => ({ myData: state.myData })
)(
  withDataLoader({
    async onEnter({ dispatch }) {
      return dispatch({ type: 'LOAD_MY_DATA' })
    }
  })(MyComponent)
);
```

### DataLoader config

* `onEnter(store: ReduxStore, renderProps: Object, query: Object, serverProps: Object): Promise<aby> | void` - Function with where data loading actions should be dispatched using `store.dispatch`. `renderProps` are the properties returned by `react-router`, `query` is a location data and `serverProps` is an object with `isServer` flag, which if `true` you can access request object with `serverProps.request`.
* `shouldReloadData(): boolean` (optional) - Should the data be loaded again when rendering the wrapped component again. If `true` (__default__) the dat will be reloaded, if `false` the data won't be loaded again provided it is present in the store.
* `Pending: React.ComponentType<any>` (optional) - React component to render when the data is being loaded. If omitted the wrapped component will be displayed with `isPending` prop.
