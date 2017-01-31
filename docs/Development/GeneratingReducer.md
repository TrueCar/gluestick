#Generating a Reducer

GlueStick applications use Redux to manage application-state. Put simply, Redux lets you manage your application-state as a single object that is propagated throughout your app. To change the state, take your current state object and pass it off to reducers that determine what the new state should look like based on a given action. GlueStick hooks up all that boilerplate code for you so that you can get right down to the business of creating the app. 

To generate a reducer, enter: ```gluestick generate reducer todos```

This will create a new file ```src/reducers/todos.js``` and modify the existing reducers index file ```src/reducers/index.js```.

GlueStick looks to ```src/reducers/index.js``` to know which reducers our Redux store should incorporate. 

src/reducers/todos.js


```bash
const INITIAL_STATE = null;

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

```

src/reducers/index.js

```bash
export { default as todos } from "./todos"
```

Next, you’ll need to modify your reducer to manage an array, so you can add todo list items to the piece of the state of which this reducer is in charge. For now, just change the initial state from null to an array with two items in it 
```["First Item", "Second Item"]```;

```bash
const INITIAL_STATE = ["First Item", "Second Item"];

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        default:
            return state;
    }
};
```