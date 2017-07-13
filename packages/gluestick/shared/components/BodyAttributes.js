/* @flow */

import { Component, Children, PropTypes } from 'react';
import withSideEffect from 'react-side-effect';

const supportedHTML4Attributes: { bgColor: string } = {
  bgColor: 'bgcolor',
};

type Props = {
  children: any,
};

class BodyAttributes extends Component<void, Props, void> {
  render() {
    return Children.only(this.props.children);
  }
}

BodyAttributes.propTypes = {
  children: PropTypes.node.isRequired,
};

function reducePropsToState(propsList: Object[]) {
  const attrs = {};
  propsList.forEach((props: Object) => {
    const transformedAttrs = transformHTML4Props(props);
    Object.assign(attrs, props, transformedAttrs);
  });
  return attrs;
}

function handleStateChangeOnClient(attrs: Object) {
  for (const key in attrs) {
    if (document.body) {
      if (key === 'className') {
        document.body.setAttribute('class', attrs[key]);
      } else {
        document.body.setAttribute(key, attrs[key]);
      }
    }
  }
}

function transformHTML4Props(props: Object) {
  const transformedProps = {};

  /*
   * Provide support for HTML4 attributes on the body tag for
   * e-mail purposes. Convert tags to ones oy-vey can translate
   * during the render.
   *
   * Note: Only attributes that are white-listed by oy-vey will be rendered
   *
   */
  Object.keys(supportedHTML4Attributes).forEach((propName: string) => {
    if (Object.prototype.hasOwnProperty.call(props, propName)) {
      const name: string = supportedHTML4Attributes[propName];
      const value: string = props[propName];
      const transformedProp: { [key: string]: string } = {
        [`data-oy-${name}`]: value,
      };
      Object.assign(transformedProps, transformedProp);
    }
  });
  return transformedProps;
}

export default withSideEffect(reducePropsToState, handleStateChangeOnClient)(
  BodyAttributes,
);
