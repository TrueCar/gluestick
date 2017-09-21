# Make an action creator

The reducer that you just created determines the new state based on an action that is passed to it. These actions are typically simple objects that include a type property and value and will include any additional data the reducer will need to perform the action. An action for creating a new todo might look like this:

```bash
{
    type: "ADD_TODO",
    text: "Write getting started guide"
}
```
Given that typing these objects out every time is inefficient, the typical flow in a Redux application uses “action creators.” These are very simple functions that return action objects. This will give us a nice place to expose the type as a constant for your reducer, as well. You don’t create a generator for action creators because, as you will see, there’s nothing to generate.

Create a new file ```src/actions/todos.js```

```bash

export const ADD_TODO = "ADD_TODO";

export function addTodo (text) {
    return {
        type: ADD_TODO,
        text: text
    };
}
```
Now tell the reducer what to do with this action. Edit ```src/reducers/todos.js```

```bash
import { ADD_TODO } from "../actions/todos";

const INITIAL_STATE = ["First Item", "Second Item"];

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TODO:
            return [action.text, ...state];
        default:
            return state;
    }
};
```


First, import your ```ADD_TODO``` constant at the top.

Then, add a special case to a switch statement for actions of that type.

Then, create a new array with the todo text and copy over the old array using the ES2015 spread operator.

Note: create a new array; don’t mutate the old array. This is an important requirement of Redux as their documentation states: “For now, just remember that the reducer must be pure. Given the same arguments, it should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Just a calculation.”

See the Redux documentation on Reducers for more information.
