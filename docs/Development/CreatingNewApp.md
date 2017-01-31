
# Creating a new application

GlueStick attempts to handle as much of the non-application specific code as it can for you. However, there is still some boilerplate code and a common folder structure that you will need in order to build a GlueStick app. To make this simple, GlueStick provides the “new” command.

Time to create a new project: to create a new project, run the following command:

```bash
gluestick new ExampleApp
```

This is will create a folder named ExampleApp in the folder on which you just ran the command. GlueStick sets up the folder structure and installs all of the ```node_modules `` that you will need for the base application.
Here is an example of what you can expect to see in the newly created ExampleApp folder:

```bash

assets/
  - css
    - normalize.css
Index.js
package.json
src/
    - actions/
    - components/
        - Home.js
        - MasterLayout.js
    - config/
        - application.js
        - routes.js
    - containers/
        - HomeApp.js
    - reducers/
        - index.js
test/
    - components/
        - Home.test.js
 ```      