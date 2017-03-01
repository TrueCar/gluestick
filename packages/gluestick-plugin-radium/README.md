# `gluestick-plugin-radium`
This plugin allows to specify set of tools to manage inline styles on React elements.

## How to use
* Install plugin
```
npm install --save gluestick-plugin-radium
```
* Define (and configure) plugin in `src/gluestick.plugins.js`:
```
export default [
 {
   plugin: 'gluestick-plugin-radium',
   rootWrapper: true
 }
]
```

## Example usage
```
import React, { Component } from "react";

export default class Home extends Component {
  render () {
    return (
        <div style={styles.base}>Home</div>
    );
  }
}

const styles = {
  base: {
    color: "blue",
  },
};
```
