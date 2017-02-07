/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
   import React, { Component } from "react";

   export default class Home extends Component {
    render () {
      return (
        <div>Home</div>
    );
   }
 }
  `;
  return template;
};
