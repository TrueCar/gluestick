# `gluestick-plugin-aphrodite`
This plugin allows you to specify a set of tools to manage inline styles on React elements.

## How to use
* Install plugin
```
npm install --save gluestick-plugin-aphrodite
```
* Define (and configure) plugin in `src/gluestick.plugins.js`:
```javascript
export default [
 'gluestick-plugin-aphrodite',
]
```

## Example usage
```javascript
import React, { Component } from "react";
import { StyleSheet, css } from "aphrodite";

export default class Home extends Component {
  render () {
    return (
        <div className={css(styles.red)}>Home</div>;
    );
  }
}

const styles = StyleSheet.create({
  red: {
    color: "red",
  },
});
```
