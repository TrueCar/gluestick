# Styles
The preferred way to style components in the GlueStick environment is to use
[Radium](https://github.com/FormidableLabs/radium), but we also actively use
and support CSS and SASS.

#### CSS and SASS
If you want to include a base stylesheet (like bootstrap css), you can import
your stylesheet at the top of any file and it will be included when the page
loads. Any updates to your styles will also be hot loaded. You can use plain
CSS or SASS.

Example:
Edit /Index.js
```
import React, { Component } from "react";
import "assets/css/my-custom-css.css";
…
```

The code above will automatically extract the css from the referenced file and
include it in a base css file that is included on new page loads. References to
images and font files will automatically be handled as well.

Please note that if you use external modules (packages in `node_modules`), you need
to use the relative path or `compiled` alias. Otherwise, those modules won't be
compiled - loaders won't process them.
Read more [here](https://github.com/TrueCar/gluestick/issues/734)

```
import "compiled/bootstrap/dist/css/bootstrap.css";
```


_If you would like to see better CSS support, please submit a pull request :)_
