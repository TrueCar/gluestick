If you made it this far, you just built a todo list application using GlueStick and the array of frameworks it glues together for you! Hip Hip Hooray! You’ll notice that refreshing the web browser resets the list to the initial state. That is because you haven’t done anything to persist the data yet. You could keep things in the browser by using LocalStorage or hitting a server API in your action creators.

GlueStick gives you a couple middleware functions for your Redux store: Redux Thunk and our own Promise middleware.

Creating an action creator that needs to hit an API should be done with the Promise middleware. Here is an example of what that would look like:

```bash
export function getTodos () {
    return {
        type: "GET_TODOS",
        promise: new Promise((resolve) => {
            someAsyncMethod((result) => {
                resolve(result);
            });
        })
    };
}
```

The promise middleware can fire off three of its own actions. If your action type is ```GET_TODOS```, then it will first dispatch ```GET_TODOS_INIT```. It is up to you if you want to handle this action or not. This is a good place to update the state to show a loading spinner.

```GET_TODOS``` will only be triggerd once the promise resolves. When you call resolve from inside your promise, any value passed to the resolve method will be available on the action object under as action.value.
```GET_TODOS_FAILURE``` will be triggered if the promise fails to resolve. This gives you the chance to notify the user that something went wrong.