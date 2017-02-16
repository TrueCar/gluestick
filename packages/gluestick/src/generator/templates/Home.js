/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
import React, { Component } from "react";

export default class Home extends Component {
  render () {
    return (
      <div>Home</div>
    );
  }
}
`;
