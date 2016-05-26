import { Component, Children, PropTypes } from "react";
import withSideEffect from "react-side-effect";


const supportedHTML4Attributes = {
  "bgColor": "bgcolor"
};

class BodyAttributes extends Component {
  render() {
    return Children.only(this.props.children);
  }
}

BodyAttributes.propTypes = {
  children: PropTypes.node.isRequired
};

function reducePropsToState(propsList) {
  const attrs = {};
  propsList.forEach(function (props) {
    const transformedAttrs = transformHTML4Props(props);
    Object.assign(attrs, props, transformedAttrs);
  });
  return attrs;
}

function handleStateChangeOnClient(attrs) {
  for (const key in attrs) {
    document.body.setAttribute(key, attrs[key]);
  }
}

function transformHTML4Props(props) {
  const transformedProps = {};

  // Provide support for HTML4 attributes on the body tag for
  // e-mail purposes. Convert tags to ones oy-vey can translate
  // during the render.
  Object.keys(supportedHTML4Attributes).forEach(propName => {
    if (props.hasOwnProperty(propName)) {
      const name = supportedHTML4Attributes[propName];
      const value = props[propName];
      const transformedProp = { [`data-oy-${name}`]: value };
      Object.assign(transformedProps, transformedProp);
    }
  });
  return transformedProps;
}

export default withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient
)(BodyAttributes);
