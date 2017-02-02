module.exports = (createTemplate) => {
  const template = createTemplate`
   /* @flow */
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
