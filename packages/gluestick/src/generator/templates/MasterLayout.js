/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    import React, { Component, PropTypes } from "react";
    import Helmet from "react-helmet";
    import config from "../config/application";

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
  return template;
};
