# Caching & Hooks

## Caching
Caching support has been added for server side rendering. This lets you cache
entire page responses on pages where it makes sense like a home or landing
page.

Example:
```javascript
<Route path="/" component={HomeApp} cache={true} />
```

*Route property:*
`cache` - boolean

*Additional optional cache properties:*
`cacheTTL` - number of seconds to store the cache for a particular route

Gluestick allows SSR component caching by using [`electrode-react-ssr-caching`](https://github.com/electrode-io/electrode-react-ssr-caching).
For using it you need to determine `cacheConfig` in `src/config/caching.server.js`

Example:
```javascript
export default {
  components: {
    "Component1": {
        strategy: "simple",
        enable: true
    },
    "Component2": {
        strategy: "template",
        enable: true
    },
  },
};
```

[`Here`](https://github.com/electrode-io/electrode-react-ssr-caching) you can find more information about `cacheConfig`.


## Hooks
Gluestick also provide hooks which can be defined in `src/gluestick.hooks.js`.
You can use single hook or array of hooks like in example below. Usually you have to return modified value at the end of hook.
```javascript
/* src/gluestick.hooks.js */

const preRenderFromCache = (cachedOutput) => {
  // Do something with output and return it.
  // Gluestick will render output with changes.
  return cachedOutput;
};

const postRenderRequirementsOne = (requirements) => {
  // Do something with requirements and return it.
  return requirements;
}

const postRenderRequirementsTwo = (requirements) => {
  // Here we have requirements with changes from postRenderRequirementsOne.
  return requirements;
}

const errorHook = (error) => {
  // In this hook we don't need to return value.
  // Unless you have another error hook which will be called after this one.
  console.log('Custom hook for error', error);
}

export default {
  preRenderFromCache,
  postRenderRequirements: [
    postRenderRequirementsOne,
    postRenderRequirementsTwo,
  ],
  error: errorHook,
};
```

| name                   | need return value? |            when it is called?            |
|------------------------|:------------------:|:----------------------------------------:|
| preInitServer          |        false       | before server is started                 |
| postServerRun          |        false       | after server is run                      |
| preRenderFromCache     |        true        | before we render output from cache       |
| postRenderRequirements |        true        | after we get requirements for entrypoint |
| preRedirect            |        false       | before redirect                          |
| postRenderProps        |        true        | after we get render props                |
| postGetCurrentRoute    |        true        | after we get current route               |
| postRender             |        true        | after render                             |
| error                  |        false       | before we render error template          |
