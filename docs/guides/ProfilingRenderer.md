# Profiling GlueStick renderer

__Requirements: node 8.4.0+__

In order to start profiling gluestick renderer (aka server), the first thing you need to do is to capture the profile information. Just follow these steps:

1. Run `gluestick start-client` command.

3. Run `gluestick start-server -D` command in a separate terminal/tab.
    > `-D` flag is used to run the server in debug mode.

3. Open __Chrome Dev Tools__ (`cmd + alt + i` on MacOS)

4. Click __Node.js__ logo in top-left corner

    ![Open Node.js DevTools](./img/open-nodejs-devtools.png)

5. Navigate to __Profiler tab__ and click __record button__

    ![Record profile](./img/record-profile.png)

6. Open the desired page served by GlueStick in a browser, for instance `http://localhost:8880`.

7. Stop recording after the page is loaded.

    ![Stop recording the profile](./img/stop-profiling.png)


You should see the profile chart now.

![Profile chart](./img/profile-chart.png)


Now you can see the trace and the time spent on each function call, so you can analyse, pinpoint the expensive functions and optimise them.

__Tip:__ By clicking on the function call in the chart, you will be redirected to its source.

## Other resources

* https://stackoverflow.com/questions/1911015/how-do-i-debug-node-js-applications/16512303#16512303
* http://commandlinefanatic.com/cgi-bin/showarticle.cgi?article=art037
* http://blog.librato.com/posts/chrome-devtools
