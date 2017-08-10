/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React, { Component } from "react";
import "./Home.css";

export default class Home extends Component {
  render () {
    return (
      <div>
        <div className="Home-header">
          <h1>Welcome to Gluestick</h1>
        </div>
        <div className="Home-row">
          <div className="Home-box">
            <h2>Quick Start</h2>
            <p>
              Edit and save <code>src/apps/main/components/Home.js</code> This page will automatically update.
            </p>
          </div>
        </div>
        <div className="Home-row">
          <div className="Home-box">
            <h3><code>gluestick start</code></h3>
            <p>Start your application.</p>
          </div>
          <div className="Home-box">
            <h3><code>gluestick test</code></h3>
            <p>Run tests on your code.</p>
          </div>
          <div className="Home-box">
            <h3><code>gluestick generate</code></h3>
            <p>Generators for all kinds of things.</p>
          </div>
        </div>
      </div>
    );
  }
}
`;
