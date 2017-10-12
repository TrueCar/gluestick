/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "config/application";

export default class MasterLayout extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render () {
    return (
      <div>
        <Helmet {...config.head}/>
        {this.props.children}
      </div>
    );
  }
}
`;
