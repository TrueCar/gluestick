One of our favorite features of GlueStick is hot module replacement, an awesome feature that allows for updates to show without refreshing the browser. To start, open src/components/Home.js in your favorite editor, and replace the word “Home” with “Hello World!”. Make sure the web browser is visible when you do this. and you will see that “Home” will magically change to “Hello World!” right before your very eyes…without even having to refresh the browser.

You’re going to work on styling next, so let’s discuss our styling tool: Radium. (We won’t go into all of the details as to why Radium is so amazing; the Radium docs do a good enough job of that.) GlueStick projects have Radium in-built for you so all its awesomeness is there for your use.

Follow these four simple steps to use Radium with your component.

1. Import Radium

```bash
import Radium from "radium"
```

2. Decorate your class using the Radium decorator

```bash
@Radium
export default class Home extends Component {
```

3. Define your styles in an object.

```bash
const styles = {
    header: {
        color: "green"
    }
};
```

4. Apply the style to an element

```bash
<div style={styles.header}>Hello World!</div>
```

So your entire component should now look like this:

```bash
import React, { Component, PropTypes } from "react";
import Radium from "radium";

@Radium
export default class Home extends Component {
    render () {
        return (
            <div style={styles.header}>
                Hello World!
            </div>
        );
    }
}

const styles = {
    header: {
        color: "green"
    }
};

```


Immediately after you save the file, “Hello World!” will turn green—no refresh needed. The ability to quickly iterate over styles without refreshing the browser is a huge time saver and results in a boost in productivity. Thanks to the array of open source tools we use under the hood with GlueStick, this kind of flow was relatively easy to build and is very helpful.