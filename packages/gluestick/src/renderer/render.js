const React = require('react');
const { RouterContext } = require('react-router');
const Oy = require('oy-vey').default;
const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const linkAssets = require('./helpers/linkAssets');

const getRenderer = (isEmail, renderMethod) => {
  if (renderMethod) {
    return renderMethod;
  }
  return isEmail ? renderToStaticMarkup : renderToString;
};

module.exports = async (
  context,
  req,
  { EntryPoint, entryName, store, routes, httpClient },
  { renderProps, currentRoute },
  { EntryWrapper, BodyWrapper, entryWrapperConfig, envVariables, getHead },
  { assets, cacheManager },
  { renderMethod },
) => {
  const { styleTags, scriptTags } = linkAssets(context, entryName, assets);
  const isEmail = !!currentRoute.email;
  const routerContext = <RouterContext {...renderProps} />;
  const entryWrapper = (
    <EntryWrapper
      store={store}
      routerContext={routerContext}
      config={entryWrapperConfig}
      getRoutes={routes}
      httpClient={httpClient}
    />
  );

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState = store.getState();

  const renderResults = getRenderer(isEmail, renderMethod)(entryWrapper, styleTags);
  const bodyWrapperContent = renderMethod ? renderResults.body : renderResults;
  const bodyWrapper = (
    <BodyWrapper
      html={bodyWrapperContent}
      initialState={currentState}
      isEmail={isEmail}
      envVariables={envVariables}
      scriptTags={scriptTags}
    />
  );


  // Grab the html from the project which is stored in the root
  // folder named Index.js. Pass the body and the head to that
  // component. `head` includes stuff that we want the server to
  // always add inside the <head> tag.
  //
  // Bundle it all up into a string, add the doctype and deliver
  const rootElement = (
    <EntryPoint
      body={bodyWrapper}
      head={isEmail ? null : renderResults.head || styleTags}
      req={req}
    />
  );

  let responseString;
  if (isEmail) {
    const generateCustomTemplate = ({ bodyContent }) => { return `${bodyContent}`; };
    responseString = Oy.renderTemplate(rootElement, {}, generateCustomTemplate);
  } else {
    responseString = renderToStaticMarkup(rootElement);
  }

  cacheManager.setCacheIfProd(req, responseString);
  return {
    responseString,

    // The following is returned for testing
    rootElement,
  };
};
