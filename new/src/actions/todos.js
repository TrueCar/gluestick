export const ADD_TODO = "ADD_TODO";
export const GET_TODOS = "GET_TODOS";

export function addTodo (text) {
    return {
        type: ADD_TODO,
        text: text
    };
}

export function getTodos () {
    return {
        type: GET_TODOS,
        promise: new Promise((resolve) => {
            setTimeout(() => {
                resolve(["First item on the list", "Second item on the list"]);
            }, 500);
        })
    };
}


