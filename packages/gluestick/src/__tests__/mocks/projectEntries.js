/* @flow */
import React from 'react';

export default {
  default: {
    '/': {
      component: class extends React.Component {
        render() {
          return <div>Index</div>;
        }
      },
      reducers: {},
      routes: () => [{}],
    },
  },
  plugins: [],
};
