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
  propsList.forEach(function (props) {
    Object.assign(attrs, props);
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
