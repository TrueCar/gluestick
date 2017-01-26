React applications are made up of lots of components. They almost all start with the same few lines of code, so we made a generator to speed things up. We want to encourage developers to write unit tests for their components so we didn’t stop there. Whenever you use the generator to create a new component, it will also create a test file for that component, along with a very basic test to verify that it is rendering without any issues. To generate a new component, simply enter: gluestick generate component TodoList

This will generate two files: ```src/components/TodoList.js```


```bash
import React, { Component, PropTypes } from "react";

export default class TodoList extends Component {
    render () {
        return (
            <div>
                TodoList
            </div>
        );
    }
}
```
test/components/TodoList.test.js

```bash
import TodoList from "components/TodoList";

describe("components/TodoList", () => {
    it("should render without an issue", () => {
        const subject = <TodoList />;
        const renderedSubject = TestUtils.renderIntoDocument(subject);
        expect(renderedSubject).to.not.equal(undefined);
    });
});
```


As you continue to develop to your application, our GlueStick test suite will automatically re-run your tests. The results from these tests will show up in your terminal as they are made available. Also, you will receive push notifications each time the tests are run to show you whether or not they passed. In order to ensure as complete a testing environment as possible, our test suite is made up of Karma, Mocha, Sinon, and Chai.