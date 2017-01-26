Now that you have a new project started, running the application in the browser is next. Change directories into the ExampleApp folder `cd ExampleApp` and run the `start` command.
`gluestick start`

This will kick off a few things. It is going to run your code through webpack dev server as well as run our universal web server. The webpack dev server serves our file assets to the web browser and enables hot module replacement (explained more below). The universal web server is the part that delivers the initial html, generated from front-end code to the web browser, before the file assets are hooked up. The universal web server piece will also let us do server-side rendering of your React application.

Not only does the `start` command kick off our servers, but it also starts up our test runner in its own dedicated Chrome instance so you can have tests continuously running while you work on your app.
Now, open your browser to http://localhost:8888/ and you should be greeted with the text “Home”.