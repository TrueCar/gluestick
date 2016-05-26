import { Component, Children, PropTypes } from "react";
import withSideEffect from "react-side-effect";

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
  const transformedAttrs = {};
  propsList.forEach(function (props) {
    if (props.hasOwnProperty("bgColor")) {
      Object.assign(transformedAttrs, {"data-oy-bgcolor": props["bgColor"]});
    }
    Object.assign(attrs, props, transformedAttrs);
  });
  return attrs;
}

function handleStateChangeOnClient(attrs) {
  for (const key in attrs) {
    document.body.setAttribute(key, attrs[key]);
  }
}

export default withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient
)(BodyAttributes);
